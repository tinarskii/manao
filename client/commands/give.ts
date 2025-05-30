import { CommandMeta, UserData } from "../types";
import { db } from "../helpers/database";
import { ApiClient } from "@twurple/api";
import { ChatClient } from "@twurple/chat";
import { initAccount } from "../helpers/twitch";
import { t } from "../helpers/i18n";

export default {
  name: { en: "give", th: "ให้เงิน" },
  description: { en: "Give money to someone else", th: "ให้เงินผู้อื่น" },
  aliases: { en: ["transfer"], th: [] },
  args: [
    {
      name: { en: "user", th: "ผู้ใช้" },
      description: {
        en: "The user you want to give money",
        th: "ผู้ใช้ที่คุณต้องการให้เงิน",
      },
      required: true,
    },
    {
      name: { en: "amount", th: "จำนวนเงิน" },
      description: {
        en: "The amount of money you want to give",
        th: "จำนวนเงินที่คุณต้องการให้",
      },
      required: true,
    },
  ],
  execute: async (
    client: { api: ApiClient; chat: ChatClient; io: any },
    meta: CommandMeta,
    message: string,
    args: Array<string>,
  ) => {
    const amount = Math.trunc(parseInt(args[1]));
    const [target] = args;

    // Check if amount is valid
    if (isNaN(amount) || amount < 0) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("economy.errorInvalidAmount", meta.lang)}`,
      );
      return;
    }

    // Check if user has enough money
    let stmt = db.prepare("SELECT money FROM users WHERE user = ?");
    let balance = stmt.get(meta.userID) as Pick<UserData, "money">;
    if (!stmt.get(meta.userID) || !balance) {
      initAccount(meta.userID);
      balance = { money: 0 };
    }

    if (amount > balance.money) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("economy.errorInsufficientFunds", meta.lang)}`,
      );
      return;
    }

    // Check if target is valid
    const targetUser = await client.api.users.getUserByName(target);
    if (!targetUser) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("economy.errorUserNotFound", meta.lang, target)}`,
      );
      return;
    }
    const targetID = targetUser.id;
    initAccount(targetID);

    // Transfer money
    stmt = db.prepare("UPDATE users SET money = money - ? WHERE user = ?");
    stmt.run(amount, meta.userID);
    stmt = db.prepare("UPDATE users SET money = money + ? WHERE user = ?");
    stmt.run(amount, targetID);
    await client.chat.say(
      meta.channel,
      `@${meta.user} ${t("economy.transactionSuccess", meta.lang, amount, meta.currency, target)}`,
    );
    client.io.emit("feed", {
      type: "normal",
      icon: "📩",
      message: `${meta.user} ➡ ${target}`,
      action: `${amount} ${meta.currency}`,
    });
  },
};
