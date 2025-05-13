import { CommandMeta } from "../types";
import { db } from "../helpers/database";
import { ApiClient } from "@twurple/api";
import { ChatClient } from "@twurple/chat";
import { initAccount } from "../helpers/twitch";
import { t } from "../helpers/i18n";

export default {
  name: { en: "gamble", th: "พนัน" },
  description: {
    en: "For you, gambling addict",
    th: "สำหรับคนติดพนันอย่างคุณ",
  },
  aliases: { en: ["bet"], th: [] },
  args: [
    {
      name: { en: "amount", th: "จำนวนเงิน" },
      description: {
        en: "Amount of money to gamble",
        th: "จำนวนเงินที่ต้องการพนัน",
      },
      required: false,
    },
  ],
  execute: async (
    client: { api: ApiClient; chat: ChatClient; io: any },
    meta: CommandMeta,
    message: string,
    args: Array<string>,
  ) => {
    let amount = Math.trunc(parseInt(args[0])) || 1;

    // Check if amount is valid
    if ((isNaN(amount) || amount < 0) && args[0] !== "all") {
      await client.chat.say(meta.channel, `@${meta.user} ${t("economy.errorInvalidAmount", meta.lang)}`);
      return;
    }

    initAccount(meta.userID);

    // Check if user has enough money
    let stmt = db.prepare("SELECT money FROM users WHERE user = ?");
    const balance = stmt.get(meta.userID);
    if (amount > balance.money && args[0] !== "all") {
      await client.chat.say(meta.channel, `@${meta.user} ${t("economy.errorInsufficientFunds", meta.lang)}`);
      return;
    }

    if (args[0] === "all") {
      amount = balance.money;
    }

    // Win Condition
    const win = Math.random() > 0.5;
    if (win) {
      // Gain amount * 1.75
      stmt = db.prepare("UPDATE users SET money = money + ? WHERE user = ?");
      stmt.run(amount * 1.75, meta.userID);
      await client.chat.say(
        meta.channel,
        `@${meta.user} 🎉 ${t("economy.gambleWin", meta.lang, amount * 1.75, meta.currency, balance.money + (amount * 1.75), meta.currency)}`,
      );
      client.io.emit("feed", {
        type: "success",
        icon: "🎰",
        message: meta.user,
        action: `+ ${amount * 1.75} ${meta.currency}`,
      });
    } else {
      stmt = db.prepare("UPDATE users SET money = money - ? WHERE user = ?");
      stmt.run(amount, meta.userID);
      await client.chat.say(
        meta.channel,
        `@${meta.user} ❌ ${t("economy.gambleLose", meta.lang, amount, meta.currency, balance.money - amount, meta.currency)}`,
      );
      client.io.emit("feed", {
        type: "danger",
        icon: "🎰",
        message: meta.user,
        action: `- ${amount} ${meta.currency}`,
      });
    }
  },
};
