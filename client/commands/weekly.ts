import { CommandMeta, UserData } from "../types";
import { db } from "../helpers/database";
import { ApiClient } from "@twurple/api";
import { ChatClient } from "@twurple/chat";
import { initAccount } from "../helpers/twitch";
import { t } from "../helpers/i18n";

export default {
  name: { en: "weekly", th: "รายสัปดาห์" },
  description: {
    en: "Give weekly money",
    th: "รับเงินรายสัปดาห์",
  },
  alias: [],
  args: [],
  execute: async (
    client: { api: ApiClient; chat: ChatClient; io: any },
    meta: CommandMeta,
  ) => {
    initAccount(meta.userID);

    // Find last weekly (Int)
    let stmt = db.prepare("SELECT lastWeekly FROM users WHERE user = ?");
    const lastWeekly = stmt.get(meta.userID) as Pick<UserData, "lastWeekly">;

    // Check if user has claimed weekly
    if (lastWeekly) {
      const lastWeeklyDate = new Date(lastWeekly.lastWeekly);
      const currentDate = new Date();
      const diff = Math.abs(currentDate.getTime() - lastWeeklyDate.getTime());
      const diffDays = Math.ceil(diff / (1000 * 3600 * 24));
      if (diffDays < 7) {
        await client.chat.say(
          meta.channel,
          `@${meta.user} ${t("economy.errorAlreadyWeekly", meta.lang, 7 - diffDays)}`,
        );
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
      action: `+750 ${meta.currency}`,
    });
    await client.chat.say(
      meta.channel,
      `@${meta.user} ${t("economy.getWeekly", meta.lang, 750, meta.currency)}`,
    );
  },
};
