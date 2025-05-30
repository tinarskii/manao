import { ApiClient } from "@twurple/api";
import { ChatClient } from "@twurple/chat";
import { CommandMeta } from "../types";
import { t } from "../helpers/i18n";

export default {
  name: { en: "shoutout", th: "แนะนำ" },
  description: { en: "Shoutout to someone!", th: "แนะนำใครสักคน!" },
  aliases: { en: ["so"], th: [] },
  args: [
    {
      name: { en: "user", th: "ผู้ใช้" },
      description: {
        en: "The user you want to shoutout",
        th: "ผู้ใช้ที่คุณต้องการแนะนำ",
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
    const userID = (await client.api.users.getUserByName(args[0]))?.id;

    if (!userID) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("moderation.errorUserNotFound", meta.lang, args[0])}`,
      );
      return;
    }

    try {
      await client.api.chat.shoutoutUser(meta.channelID, userID);
    } catch (e) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("moderation.errorCannotShoutout", meta.lang)}`,
      );
      return;
    }
    await client.chat.say(
      meta.channel,
      `@${meta.user} ${t("moderation.shoutoutSuccess", meta.lang, args[0])}`,
    );
  },
};
