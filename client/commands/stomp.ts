import { ApiClient } from "@twurple/api";
import { ChatClient } from "@twurple/chat";
import { CommandMeta } from "../types";
import { t } from "../helpers/i18n";

export default {
  name: { en: "stomp", th: "กระทืบ" },
  description: { en: "Stomp on someone!", th: "กระทืบใครสักคน!" },
  aliases: { en: [], th: ["ถีบ"] },
  args: [
    {
      name: { en: "user", th: "ผู้ใช้" },
      description: {
        en: "The user you want to stomp",
        th: "ผู้ใช้ที่คุณต้องการกระทืบ",
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
    const stompTimes = Math.floor(Math.random() * 1000);
    client.io.emit("feed", {
      type: "neutral",
      icon: "👣",
      message: `${meta.user} ➡ ${args[0] || meta.user}`,
      action: `${stompTimes} times`,
    });
    await client.chat.say(
      meta.channel,
      `${meta.user} 👣 ${args[0] || meta.user} ${stompTimes} ${t("misc.times", meta.lang)}`,
    );
  },
};
