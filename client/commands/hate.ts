import { ApiClient } from "@twurple/api";
import { ChatClient } from "@twurple/chat";
import { CommandList } from "../types";

export default {
  name: "hate",
  description: "For whom do you hate?",
  alias: ["เกลียด"],
  args: [
    {
      name: "user",
      description: "The user you hate",
      required: false,
    },
  ],
  execute: async (
    client: { api: ApiClient; chat: ChatClient; io: any },
    meta: {
      user: string;
      channel: string;
      channelID: string;
      userID: string;
      commands: CommandList;
    },
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
