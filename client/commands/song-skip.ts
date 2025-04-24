import { ApiClient } from "@twurple/api";
import { ChatClient } from "@twurple/chat";
import { CommandList, songQueue } from "../client";

export default {
  name: "song-skip",
  description: "Skip a song",
  alias: ["skip", "sk"],
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
    // Check if there is a song to skip
    if (songQueue.length === 0) {
      await client.chat.say(meta.channel, `@${meta.user} ไม่มีเพลงในคิว`);
      return;
    }

    // Check if user has permission to skip song (Requester or Mod)
    if (songQueue[0].user !== meta.user) {
      let isMod = await client.api.moderation.checkUserMod(
        meta.channelID,
        meta.userID,
      );
      if (!isMod) {
        await client.chat.say(
          meta.channel,
          `@${meta.user} ไม่สามารถลบเพลงของคนอื่นได้`,
        );
        return;
      }
    }

    songQueue.shift();
    client.io.emit("songSkip", songQueue);

    await client.chat.say(
      meta.channel,
      `@${meta.user} ข้ามเพลงแล้ว (คิว ${songQueue.length} เพลง)`,
    );
  },
};
