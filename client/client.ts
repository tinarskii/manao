import "dotenv/config";
import { StaticAuthProvider } from "@twurple/auth";
import {
  buildEmoteImageUrl,
  ChatClient,
  parseEmotePositions,
} from "@twurple/chat";
import { ApiClient } from "@twurple/api";
import { readdirSync } from "fs";
import pino from "pino";
import { io } from "../server/server";
import { join } from "node:path";
import {
  checkNickname,
  isTwitchTokenValid,
  refreshToken,
} from "../helpers/twitch";
import * as process from "process";

if (
  !process.env.REFRESH_TOKEN ||
  !process.env.CLIENT_ID ||
  !process.env.CLIENT_SECRET ||
  !process.env.USER_ACCESS_TOKEN
) {
  throw new Error("Missing environment variables");
}

export const logger = pino({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
});

export interface CommandList
  extends Map<
    string,
    {
      name: string;
      description: string;
      alias?: Array<string>;
      args?: Array<{ name: string; description: string; required: boolean }>;
      modsOnly?: boolean;
      execute: (
        client: { chat: ChatClient; io: any; api: ApiClient },
        meta: {
          channel: string;
          user: string;
          userID: string;
          channelID: string;
          commands: CommandList;
        },
        message: string,
        args: Array<string>,
      ) => void;
    }
  > {}

export const commands: CommandList = new Map();
const prefix = "!";

export async function createListener() {
  const authProvider = new StaticAuthProvider(
    process.env.CLIENT_ID!,
    process.env.USER_ACCESS_TOKEN!,
    [
      "user:edit",
      "user:read:email",
      "chat:read",
      "chat:edit",
      "channel:moderate",
      "moderation:read",
      "moderator:manage:shoutouts",
      "channel:manage:moderators",
      "channel:manage:broadcast",
      "channel:read:vips",
      "channel:read:subscriptions",
      "channel:manage:vips",
    ],
  );

  const apiClient = new ApiClient({ authProvider });
  const chatClient = new ChatClient({ authProvider, channels: [process.env.TW_CHANNEL ?? "tinarskii"] });
  chatClient.connect();

  // On Bot Connect
  chatClient.onConnect(async () => {
    // Load commands from /command
    let commandFiles = readdirSync(join(__dirname, "/commands")).filter(
      (file) => file.endsWith(".ts"),
    );
    for (let file of commandFiles) {
      let command = (await import(`./commands/${file}`)).default;
      commands.set(command.name, command);
      logger.info(`[Tx] Loaded command: ${command.name}`);
    }
    logger.info("[Tx] Connected to chat");
  });

  // On Message Receive
  chatClient.onMessage(async (channel, user, message, msgObj) => {
    let userID = msgObj.userInfo.userId!;
    let channelID = msgObj.channelId!;
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
      let command = commands.get(commandName)!;
      if (!command) return;

      // Check if user is a mod
      if (command?.modsOnly) {
        let mods = await apiClient.moderation.checkUserMod(channelID, userID);
        if (!mods && userID !== channelID) {
          await chatClient.say(channel, `แกไม่มีสิทธิ!!!!!!!!!!!!`);
          return;
        }
      }
      // Check if user entered enough arguments
      if ((command.args?.length || 0) > args.length && command.args) {
        let requiredArgs = command.args.filter(
          (arg: { required?: boolean }) => arg.required,
        );
        if (requiredArgs.length) {
          let requiredArgsString = requiredArgs
            .map((arg: { name: string }) => arg.name)
            .join(", ");
          await chatClient.say(
            channel,
            `ใส่อาร์กิวเมนต์ให้ครบ ต้องการ: ${requiredArgsString}`,
          );
          return;
        }
      }
      // Execute command
      if (command) {
        try {
          command.execute(
            { chat: chatClient, api: apiClient, io },
            { channel, channelID, user, userID, commands },
            message,
            args,
          );
        } catch (error) {
          await chatClient.say(channel, "มึงทำบอตพัง");
        }
      }
    } else {
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
      let newMessage = message,
        emoteList = parseEmotePositions(message, msgObj.emoteOffsets);
      for (let emote of emoteList) {
        let emoteID = emote.id;
        let emoteUrl = buildEmoteImageUrl(emoteID, { size: "3.0" });
        newMessage = newMessage.replace(
          emote.name,
          `<img src="${emoteUrl}" alt="emote" /> `,
        );
      }

      // Get user badges
      let badgeList: Array<string> = [];
      let gBadges = await apiClient.chat.getGlobalBadges();
      let gBadgeTitles = gBadges.map((badge) => {
        return {
          title: badge.getVersion("1")?.title,
          link: badge.getVersion("1")?.getImageUrl(4),
        };
      });
      [...msgObj.userInfo.badges.keys()].forEach((badge) => {
        let badgeTitle = gBadgeTitles.find(
          (b) => b.title?.toLowerCase().split(" ").join("-") === badge,
        );
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
}

await refreshToken();
if (await isTwitchTokenValid(process.env.USER_ACCESS_TOKEN!)) {
  await createListener();
} else {
  throw new Error("[Tx] Invalid token");
}
