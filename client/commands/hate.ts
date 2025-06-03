import { ApiClient } from "@twurple/api";
import { ChatClient } from "@twurple/chat";
import { CommandMeta } from "../../types";

export default {
  name: { en: "hate", th: "เกลียด" },
  description: { en: "For whom do you hate?", th: "คุณเกลียดใคร?" },
  aliases: { en: [], th: ["เกลียด"] },
  args: [
    {
      name: { en: "user", th: "ผู้ใช้" },
      description: { en: "The user you hate", th: "ผู้ใช้ที่คุณเกลียด" },
      required: false,
    },
  ],
  execute: async (
    client: { api: ApiClient; chat: ChatClient; io: any },
    meta: CommandMeta,
    message: string,
    args: Array<string>,
  ) => {
    const hatePercent = Math.floor(Math.random() * 101);
    await client.chat.say(
      meta.channel,
      `${meta.user} 👿 ${args[0] || meta.user} ${hatePercent}%`,
    );
  },
};
