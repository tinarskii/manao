import { CommandMeta } from "../types";
import { db } from "../helpers/database";
import { ApiClient } from "@twurple/api";
import { ChatClient } from "@twurple/chat";
import { initAccount } from "../helpers/twitch";
import { t } from "../helpers/i18n";

export default {
  name: { en: "set", th: "ตั้งค่าเงิน" },
  description: { en: "Set user's money", th: "ตั้งค่าเงินของผู้ใช้" },
  aliases: { en: ["s"], th: ["ตั้งเงิน"] },
  args: [
    {
      name: { en: "user", th: "ผู้ใช้" },
      description: {
        en: "The user you want to set money",
        th: "ผู้ใช้ที่คุณต้องการตั้งค่าเงิน",
      },
      required: true,
    },
    {
      name: { en: "amount", th: "จำนวนเงิน" },
      description: {
        en: "The amount of money you want to set",
        th: "จำนวนเงินที่คุณต้องการตั้งค่า",
      },
      required: true,
    },
  ],
  modsOnly: true,
  execute: async (
    client: { api: ApiClient; chat: ChatClient; io: any },
    meta: CommandMeta,
    message: string,
    args: Array<string>,
  ) => {
    const amount = Math.trunc(parseInt(args[1]));
    const target = args[0];

    // Check if amount is valid
    if (isNaN(amount) || amount < 0) {
      await client.chat.say(meta.channel, `@${meta.user} ${t("economy.errorInvalidAmount", meta.lang)}`);
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

    // Set user's money
    const stmt = db.prepare("UPDATE users SET money = ? WHERE user = ?");
    stmt.run(amount, targetID);

    client.io.emit("feed", {
      type: "normal",
      icon: "📩",
      message: `System ➡ ${target}`,
      action: `${amount} ${meta.currency}`,
    });
  },
};
