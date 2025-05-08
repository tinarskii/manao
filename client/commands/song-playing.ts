import { ApiClient } from "@twurple/api";
import { ChatClient } from "@twurple/chat";
import { CommandList } from "../types";
import { songQueue } from "../services/chat";

export default {
  name: "song-playing",
  description: "Display the currently playing song",
  alias: ["playing", "nowplaying", "np"],
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
    // Check if there is a song currently playing
    if (songQueue.length === 0) {
      await client.chat.say(meta.channel, `@${meta.user} ไม่มีเพลงในคิว`);
      return;
    }

    const currentSong = songQueue[0];
    const songTitle = currentSong.song.title;
    const songAuthor = currentSong.song.author
    const songUser = currentSong.user;

    await client.chat.say(
      meta.channel,
      `@${meta.user} ตอนนี้กำลังเล่น "${songTitle}" โดย ${songUser} — ${songAuthor} รีเควส ((${songQueue.length === 0 ? 'ไม่มีเพลงในคิว' : `มี ${songQueue.length} เพลงในคิว`}))`,
    );
  },
};
