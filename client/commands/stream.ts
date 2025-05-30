import { ApiClient } from "@twurple/api";
import { ChatClient } from "@twurple/chat";
import { CommandMeta } from "../types";
import { t } from "../helpers/i18n";

export default {
  name: { en: "stream", th: "ชื่อสตรีม" },
  description: { en: "Change the stream's name", th: "เปลี่ยนชื่อของสตรีม" },
  aliases: { en: ["s"], th: ["สตรีม"] },
  args: [
    {
      name: { en: "name", th: "ชื่อใหม่" },
      description: {
        en: "The name you want to change to",
        th: "ชื่อที่คุณต้องการเปลี่ยน",
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
    // Get channel ID
    await client.api.channels.updateChannelInfo(meta.channelID, {
      title: args.join(" "),
    });

    await client.chat.say(
      meta.channel,
      t("moderation.streamTitleChanged", meta.lang, args.join(" ")),
    );
  },
};
