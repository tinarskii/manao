import { ApiClient } from "@twurple/api";
import { ChatClient } from "@twurple/chat";
import { CommandMeta } from "../types";
import { logger } from "../helpers/logger";
import { t } from "../helpers/i18n";

export default {
  name: {
    en: "announce",
    th: "ประกาศ",
  },
  description: {
    en: "Announce a message to the channel",
    th: "ประกาศข้อความไปยังช่อง",
  },
  aliases: {
    en: ["a", "an"],
    th: ["ป", "แจ้ง"],
  },
  args: [
    {
      name: {
        en: "message",
        th: "ข้อความ",
      },
      description: {
        en: "Message to announce",
        th: "ข้อความที่ต้องการประกาศ",
      },
      required: true,
    },
  ],
  modsOnly: true,
  execute: async (
    client: { api: ApiClient; chat: ChatClient; io: any },
    meta: CommandMeta,
    _: string,
    args: Array<string>,
  ) => {
    const message = args.join(" ");

    try {
      await client.api.chat.sendAnnouncement(meta.channelID, {
        message,
      });
    } catch (e) {
      logger.error(e);
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("moderation.errorCannotAnnounce", meta.lang)}`,
      );
      return;
    }
  },
};
