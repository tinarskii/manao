import "dotenv/config";
import { RefreshingAuthProvider } from "@twurple/auth";
import { buildEmoteImageUrl, ChatClient, parseEmotePositions, } from "@twurple/chat";
import { ApiClient } from "@twurple/api";
import { EventSubWsListener } from '@twurple/eventsub-ws';
import { readdirSync } from "fs";
import pino from "pino";
import { io } from "../server/server";
import { join } from "node:path";
import { checkNickname, initAccount } from "../helpers/twitch";
import * as process from "process";
import { db } from "../helpers/database";
if (!process.env.REFRESH_TOKEN ||
    !process.env.CLIENT_ID ||
    !process.env.CLIENT_SECRET ||
    !process.env.USER_ACCESS_TOKEN) {
    throw new Error("Missing environment variables");
}
process.env.EXPIRES_IN = "0";
process.env.OBTAINMENT_TIMESTAMP = "0";
export const logger = pino({
    transport: {
        target: "pino-pretty",
        options: {
            colorize: true,
        },
    },
});
export const commands = new Map();
export let songQueue = [];
const prefix = "!";
const authProvider = new RefreshingAuthProvider({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
});
authProvider.onRefresh(async (userID, newTokenData) => {
    if (userID == process.env.TW_ID) {
        process.env.REFRESH_TOKEN = newTokenData.refreshToken;
        process.env.USER_ACCESS_TOKEN = newTokenData.accessToken;
        process.env.EXPIRES_IN = String(newTokenData.expiresIn);
        process.env.OBTAINMENT_TIMESTAMP = String(newTokenData.obtainmentTimestamp);
    }
    else if (userID == process.env.BROADCASTER_ID) {
        process.env.BROADCASTER_REFRESH_TOKEN = newTokenData.refreshToken;
        process.env.BROADCASTER_USER_ACCESS_TOKEN = newTokenData.accessToken;
        process.env.EXPIRES_IN = String(newTokenData.expiresIn);
        process.env.OBTAINMENT_TIMESTAMP = String(newTokenData.obtainmentTimestamp);
    }
});
authProvider.addUser(process.env.TW_ID, {
    accessToken: process.env.USER_ACCESS_TOKEN,
    refreshToken: process.env.REFRESH_TOKEN,
    expiresIn: Number(process.env.EXPIRES_IN),
    obtainmentTimestamp: Number(process.env.OBTAINMENT_TIMESTAMP),
}, ["chat"]);
authProvider.addUser(process.env.BROADCASTER_ID, {
    accessToken: process.env.BROADCASTER_USER_ACCESS_TOKEN,
    refreshToken: process.env.BROADCASTER_REFRESH_TOKEN,
    expiresIn: Number(process.env.EXPIRES_IN),
    obtainmentTimestamp: Number(process.env.OBTAINMENT_TIMESTAMP),
});
const apiClient = new ApiClient({ authProvider });
const chatClient = new ChatClient({
    authProvider,
    channels: [process.env.TW_CHANNEL ?? "tinarskii"],
});
chatClient.connect();
// This is necessary to prevent conflict errors resulting from ngrok assigning a new host name every time
await apiClient.eventSub.deleteAllSubscriptions();
// On Bot Connect
chatClient.onConnect(async () => {
    // Load commands from /command
    let commandFiles = readdirSync(join(__dirname, "/commands")).filter((file) => file.endsWith(".ts"));
    for (let file of commandFiles) {
        let command = (await import(`./commands/${file}`)).default;
        commands.set(command.name, command);
        logger.info(`[Manao] Loaded command: ${command.name}`);
    }
    logger.info("[Manao] Connected to chat");
});
// On Message Receive
chatClient.onMessage(async (channel, user, message, msgObj) => {
    let userID = msgObj.userInfo.userId;
    let channelID = msgObj.channelId;
    let args = message.split(" ").splice(1);
    // Check if message is a command
    if (message.startsWith(prefix)) {
        // Get command name
        let commandName = message.split(" ")[0].slice(1);
        for (let command of commands.values()) {
            if ((command.alias || []).includes(commandName)) {
                commandName = command.name;
                break;
            }
        }
        let command = commands.get(commandName);
        if (!command)
            return;
        // Check if user is a broadcaster
        if (command?.broadcasterOnly) {
            if (userID !== channelID) {
                await chatClient.say(channel, `เฉพาะผู้ถือสิทธิเท่านั้น!!!!!!!!!!!!`);
                return;
            }
        }
        // Check if user is a mod
        if (command?.modsOnly) {
            let mods = await apiClient.moderation.checkUserMod(channelID, userID);
            if (!mods && userID !== channelID) {
                await chatClient.say(channel, `เฉพาะดาบเท่านั้น!!!!!!!!!!!!`);
                return;
            }
        }
        // Check if user entered enough arguments
        if ((command.args?.length || 0) > args.length && command.args) {
            let requiredArgs = command.args.filter((arg) => arg.required);
            if (requiredArgs.length) {
                let requiredArgsString = requiredArgs
                    .map((arg) => arg.name)
                    .join(", ");
                await chatClient.say(channel, `ใส่อาร์กิวเมนต์ให้ครบ ต้องการ: ${requiredArgsString}`);
                return;
            }
        }
        // Execute command
        if (command) {
            try {
                command.execute({ chat: chatClient, api: apiClient, io }, { channel, channelID, user, userID, commands }, message, args);
            }
            catch (error) {
                await chatClient.say(channel, "มึงทำบอตพัง");
            }
        }
    }
    else {
        // Get user nickname & role
        let nickname = checkNickname(userID);
        let role = msgObj.userInfo.isBroadcaster
            ? "broadcaster"
            : msgObj.userInfo.isMod
                ? "mod"
                : msgObj.userInfo.isVip
                    ? "vip"
                    : msgObj.userInfo.isSubscriber
                        ? "sub"
                        : "normal";
        // Parse emotes
        let newMessage = message, emoteList = parseEmotePositions(message, msgObj.emoteOffsets);
        for (let emote of emoteList) {
            let emoteID = emote.id;
            let emoteUrl = buildEmoteImageUrl(emoteID, { size: "3.0" });
            newMessage = newMessage.replace(emote.name, `<img src="${emoteUrl}" alt="emote" /> `);
        }
        // Get user badges
        let badgeList = [];
        let gBadges = await apiClient.chat.getGlobalBadges();
        let gBadgeTitles = gBadges.map((badge) => {
            return {
                title: badge.getVersion("1")?.title,
                link: badge.getVersion("1")?.getImageUrl(4),
            };
        });
        [...msgObj.userInfo.badges.keys()].forEach((badge) => {
            let badgeTitle = gBadgeTitles.find((b) => b.title?.toLowerCase().split(" ").join("-") === badge);
            if (badgeTitle) {
                badgeList.push(badgeTitle.link ?? "");
            }
        });
        io.emit("message", {
            from: nickname
                ? `${msgObj.userInfo.displayName} (${nickname})`
                : msgObj.userInfo.displayName,
            message: newMessage,
            user: msgObj.userInfo,
            id: msgObj.id,
            role: role,
            color: msgObj.userInfo.color,
            badges: badgeList,
        });
    }
});
// Create a new EventSubHttpListener
const listener = new EventSubWsListener({ apiClient });
listener.start();
// Redeem 600 KEEB
listener.onChannelRedemptionAddForReward(process.env.BROADCASTER_ID, "89e83854-07cc-432b-94ce-438d446b5a6b", (data) => {
    redeemAmount(600, data);
});
// Redeem 2200 KEEB (2000 + 10% bonus)
listener.onChannelRedemptionAddForReward(process.env.BROADCASTER_ID, "b02c1598-3ae2-4b2d-a0ab-493155baec58", (data) => {
    redeemAmount(2200, data);
});
// Redeem 5625 KEEB (5000 + 12.5% bonus)
listener.onChannelRedemptionAddForReward(process.env.BROADCASTER_ID, "51d28b56-e011-4d80-916b-f98ac4f98a3b", (data) => {
    redeemAmount(5625, data);
});
// Redeem 11500 KEEB (10000 + 15% bonus)
listener.onChannelRedemptionAddForReward(process.env.BROADCASTER_ID, "7a39f8e0-411c-4b67-939f-4ac8f8cfb192", (data) => {
    redeemAmount(11500, data);
});
// On people follow
listener.onChannelFollow(process.env.BROADCASTER_ID, process.env.TW_ID, (data) => {
    chatClient.say(process.env.TW_CHANNEL, `🎉 ${data.userName} Selamat Pagi! ยินดีต้อนรับสู่ช่องของคนรั่ว ๆ เน้ออ`);
});
listener.onChannelSubscription(process.env.BROADCASTER_ID, (data) => {
    // Add 6900 KEEB to user
    initAccount(data.userId);
    db.prepare("UPDATE users SET money = money + 6900 WHERE user = ?").run(data.userId);
    logger.info(`[Manao] Subscribe ${data.userName}`);
    io.emit("feed", {
        type: "normal",
        icon: "❤️",
        message: `System ➡ ${data.userDisplayName}`,
        action: `+ 6900 KEEB`,
    });
    chatClient.say(process.env.TW_CHANNEL, `@${data.userName} ขอบคุณที่สนับสนุนช่องนี้ด้วยนะ! (รับ 6900 กีบ)`);
});
listener.onChannelSubscriptionGift(process.env.BROADCASTER_ID, (data) => {
    // Add 6900 KEEB to user
    initAccount(data.gifterId);
    db.prepare("UPDATE users SET money = money + ? WHERE user = ?").run(6900 * data.amount, data.gifterId);
    logger.info(`[Manao] Gift ${data.gifterDisplayName}`);
    io.emit("feed", {
        type: "normal",
        icon: "❤️",
        message: `System ➡ ${data.gifterDisplayName}`,
        action: `+ ${6900 * data.amount} KEEB`,
    });
    chatClient.say(process.env.TW_CHANNEL, `@${data.gifterDisplayName} ขอบคุณที่สนับสนุนช่องนี้ด้วยนะ! (รับ ${6900 * data.amount} กีบ)`);
});
listener.onChannelCheer(process.env.BROADCASTER_ID, (data) => {
});
function redeemAmount(amount, data) {
    initAccount(data.userId);
    db.prepare("UPDATE users SET money = money + ? WHERE user = ?").run(amount, data.userId);
    logger.info(`[Manao] Redeem ${amount} KEEB for ${data.userName}`);
    io.emit("feed", {
        type: "normal",
        icon: "🔁",
        message: `System ➡ ${data.userDisplayName}`,
        action: `+ ${amount} KEEB`,
    });
    chatClient.say(process.env.TW_CHANNEL, `@${data.userName} 💵 แลกรับ ${amount} กีบสำเร็จแล้ว!`);
}
