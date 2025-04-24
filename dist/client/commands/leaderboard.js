import { db } from "../../helpers/database";
export default {
    name: "leaderboard",
    description: "View the leaderboard",
    alias: ["leader", "ld", "lb", "top", "baltop"],
    args: [],
    execute: async (client, meta) => {
        let stmt = db.prepare("SELECT * FROM users ORDER BY money DESC LIMIT 5");
        let leaderboard = stmt.all();
        let message = "🏆 สมาคมซิกม่าที่รวยที่สุด 🏆 | ";
        for (const user of leaderboard) {
            const index = leaderboard.indexOf(user);
            // Get user display name
            let username = (await client.api.users.getUserById(user.user))
                .displayName;
            message += `${index + 1}. ${username} - ${user.money}KEEB | `;
        }
        await client.chat.say(meta.channel, message);
    },
};
