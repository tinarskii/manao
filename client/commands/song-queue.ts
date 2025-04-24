import { ApiClient } from "@twurple/api";
import { ChatClient } from "@twurple/chat";
import { CommandList } from "../types";
import { songQueue } from "../services/chat";

export default {
  name: "song-queue",
  description: "Check song queue",
  alias: ["queue", "sq"],
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
    if (songQueue.length === 0) {
      await client.chat.say(meta.channel, `@${meta.user} ไม่มีเพลงในคิว`);
      return;
    }

    await client.chat.say(
      meta.channel,
      `@${meta.user} ดูคิวเพลงได้ที่ https://my.tinarskii.com:3000/queue นะคะ!`,
    );
  },
};
