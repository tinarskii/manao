import { db } from "../../helpers/database";
import { initAccount } from "../../helpers/twitch";
export default {
    name: "balance",
    description: "Check your balance",
    alias: ["bal", "money"],
    args: [
        {
            name: "user",
            description: "User to check balance",
            type: "string",
            required: false,
        },
    ],
    execute: async (client, meta, message, args) => {
        let user = await client.api.users.getUserByName(args[0] ?? meta.user);
        // If user is not found
        if (!user) {
            await client.chat.say(meta.channel, `@${meta.user} ไม่พบผู้ใช้ ${args[0]}`);
            return;
        }
        // Init bank
        initAccount(user.id);
        // Get balance
        let stmt = db.prepare("SELECT money FROM users WHERE user = ?");
        let balance = stmt.get(user.id);
        // If user is not found
        if (!balance) {
            await client.chat.say(meta.channel, `ไม่มีบัญชีของ ${user.displayName} ในระบบ`);
            return;
        }
        client.io.emit("feed", {
            type: "normal",
            icon: "👛",
            message: `${meta.user}`,
            action: `${balance.money} KEEB`,
        });
        await client.chat.say(meta.channel, `${user.displayName} มีตัง ${balance.money} กีบ`);
    },
};
