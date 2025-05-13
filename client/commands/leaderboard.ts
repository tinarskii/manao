import { ApiClient } from "@twurple/api";
import { ChatClient } from "@twurple/chat";
import { CommandMeta } from "../types";
import { db } from "../helpers/database";
import { t } from "../helpers/i18n";

export default {
  name: { en: "leaderboard", th: "อันดับ" },
  description: { en: "View the leaderboard", th: "ดูอันดับคะแนน" },
  aliases: { en: ["leader", "ld", "lb", "top", "baltop"], th: [] },
  args: [],
  execute: async (
    client: { api: ApiClient; chat: ChatClient; io: any },
    meta: CommandMeta,
  ) => {
    const stmt = db.prepare("SELECT * FROM users ORDER BY money DESC LIMIT 5");
    const leaderboard = stmt.all();
    let message = t("economy.leaderboardTitle", meta.lang);
    for (const user of leaderboard) {
      const index: number = leaderboard.indexOf(user);
      // Get user display name
      const username = (await client.api.users.getUserById(user.user))!
        .displayName;
      message += `${index + 1}. ${username} - ${user.money}${meta.currency} | `;
    }
    await client.chat.say(meta.channel, message);
  },
};
