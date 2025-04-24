import { db } from "../../helpers/database";
import { initAccount } from "../../helpers/twitch";
export default {
    name: "set",
    description: "Set user's money",
    alias: ["s"],
    args: [
        {
            name: "user",
            description: "The user you want to set money",
            required: true,
        },
        {
            name: "amount",
            description: "The amount of money you want to set",
            required: true,
        },
    ],
    modsOnly: true,
    execute: async (client, meta, message, args) => {
        let amount = Math.trunc(parseInt(args[1]));
        let target = args[0];
        // Check if amount is valid
        if (isNaN(amount) || amount < 0) {
            await client.chat.say(meta.channel, `@${meta.user} ใส่ตังเข้ามาด้วย`);
            return;
        }
        // Check if target is valid
        let targetUser = await client.api.users.getUserByName(target);
        if (!targetUser) {
            await client.chat.say(meta.channel, `@${meta.user} ไม่พบผู้ใช้ ${args[0]}`);
            return;
        }
        let targetID = targetUser.id;
        initAccount(targetID);
        // Set user's money
        let stmt = db.prepare("UPDATE users SET money = ? WHERE user = ?");
        stmt.run(amount, targetID);
        client.io.emit("feed", {
            type: "normal",
            icon: "📩",
            message: `System ➡ ${target}`,
            action: `${amount} KEEB`,
        });
    },
};
