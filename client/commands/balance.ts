import { CommandMeta, UserData } from "../types";
import { db, initAccount } from "../../helpers/database";
import { ApiClient } from "@twurple/api";
import { ChatClient } from "@twurple/chat";
import { t } from "../../helpers/i18n";

export default {
  name: { en: "balance", th: "ยอดเงิน" },
  description: { en: "Check your balance", th: "ตรวจสอบยอดเงินของคุณ" },
  aliases: { en: ["bal", "money"], th: [] },
  args: [
    {
      name: { en: "user", th: "ผู้ใช้" },
      description: {
        en: "User to check balance",
        th: "ผู้ใช้ที่ต้องการตรวจสอบยอดเงิน",
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
    const user = await client.api.users.getUserByName(args[0] ?? meta.user);

    // If user is not found
    if (!user) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("economy.errorUserNotFound", meta.lang, args[0] ?? meta.user)}`,
      );
      return;
    }

    // Init bank
    initAccount(user.id);

    // Get balance
    const stmt = db.prepare("SELECT money FROM users WHERE user = ?");
    const balance = stmt.get(user.id) as Pick<UserData, "money">;

    // If user is not found
    if (!balance) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("economy.errorAccountNotFound", meta.lang, user.displayName)}`,
      );
      return;
    }

    client.io.emit("feed", {
      type: "normal",
      icon: "👛",
      message: `${meta.user}`,
      action: `${balance.money} ${meta.currency}`,
    });
    await client.chat.say(
      meta.channel,
      `${user.displayName} ${t("economy.currentBalance", meta.lang, balance.money, meta.currency)}`,
    );
  },
};
