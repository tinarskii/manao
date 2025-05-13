import { CommandMeta } from "../types";
import { db } from "../helpers/database";
import { ApiClient } from "@twurple/api";
import { ChatClient } from "@twurple/chat";
import { initAccount } from "../helpers/twitch";
import { t } from "../helpers/i18n";

export default {
  name: { en: "daily", th: "รายวัน" },
  description: {
    en: "Give daily money",
    th: "รับเงินรายวัน",
  },
  args: [],
  execute: async (
    client: { api: ApiClient; chat: ChatClient; io: any },
    meta: CommandMeta,
    message: string,
    args: Array<string>,
  ) => {
    initAccount(meta.userID);

    // Find last daily (Int)
    let stmt = db.prepare("SELECT lastDaily FROM users WHERE user = ?");
    const lastDaily = stmt.get(meta.userID);

    // Check if user has claimed daily
    if (lastDaily) {
      const lastDailyDate = new Date(lastDaily.lastDaily);
      const currentDate = new Date();
      if (
        lastDailyDate.getDate() === currentDate.getDate() &&
        lastDailyDate.getMonth() === currentDate.getMonth() &&
        lastDailyDate.getFullYear() === currentDate.getFullYear()
      ) {
        await client.chat.say(
          meta.channel,
          `@${meta.user} ${t("economy.errorAlreadyDaily", meta.lang)}`,
        );
        return;
      }
    }

    // Claim daily (Add money, Update lastDaily)
    stmt = db.prepare("UPDATE users SET money = money + 100 WHERE user = ?");
    stmt.run(meta.userID);
    stmt = db.prepare("UPDATE users SET lastDaily = ? WHERE user = ?");
    stmt.run(Number(new Date()), meta.userID);

    await client.chat.say(meta.channel, `@${meta.user} ${t("economy.getDaily", meta.lang, 100, meta.currency)}`);
    client.io.emit("feed", {
      type: "normal",
      icon: "☀️",
      message: `System ➡ ${meta.user}`,
      action: `+100 ${meta.currency}`,
    });
  },
};
