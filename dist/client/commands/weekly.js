import { db } from "../../helpers/database";
import { initAccount } from "../../helpers/twitch";
export default {
    name: "weekly",
    description: "Give weekly money (750 Keeb)",
    alias: [],
    args: [],
    execute: async (client, meta, message, args) => {
        initAccount(meta.userID);
        // Find last weekly (Int)
        let stmt = db.prepare("SELECT lastWeekly FROM users WHERE user = ?");
        let lastWeekly = stmt.get(meta.userID);
        // Check if user has claimed weekly
        if (lastWeekly) {
            let lastWeeklyDate = new Date(lastWeekly.lastWeekly);
            let currentDate = new Date();
            let diff = Math.abs(currentDate.getTime() - lastWeeklyDate.getTime());
            let diffDays = Math.ceil(diff / (1000 * 3600 * 24));
            if (diffDays < 7) {
                await client.chat.say(meta.channel, `เองรับเงินไปแล้ว รออีก ${7 - diffDays} วัน`);
                return;
            }
        }
        // Claim weekly (Add money, Update lastWeekly)
        stmt = db.prepare("UPDATE users SET money = money + 750 WHERE user = ?");
        stmt.run(meta.userID);
        stmt = db.prepare("UPDATE users SET lastWeekly = ? WHERE user = ?");
        stmt.run(Number(new Date()), meta.userID);
        client.io.emit("feed", {
            type: "normal",
            icon: "☀️",
            message: `System ➡ ${meta.user}`,
            action: `+750 KEEB`,
        });
        await client.chat.say(meta.channel, `@${meta.user} รับ 750 กีบ`);
    },
};
