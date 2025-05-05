import { ApiClient } from "@twurple/api";
import { ChatClient } from "@twurple/chat";
import { CommandList } from "../types";

export default {
  name: "stomp",
  description: "Stomp on someone!",
  alias: ["กระทืบ"],
  args: [
    {
      name: "user",
      description: "The user you want to stomp",
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
    const stompTimes = Math.floor(Math.random() * 1000);
    client.io.emit("feed", {
      type: "neutral",
      icon: "👣",
      message: `${meta.user} ➡ ${args[0] || meta.user}`,
      action: `${stompTimes} times`,
    });
    await client.chat.say(
      meta.channel,
      `${meta.user} 👣 ${args[0] || meta.user} ${stompTimes} ครั้ง`,
    );
  },
};
