import { ApiClient } from "@twurple/api";
import { ChatClient } from "@twurple/chat";
import { CommandList } from "../types";
import { songQueue } from "../services/chat";

export default {
  name: "song-queue",
  description: "Check song queue",
  alias: ["queue", "sq"],
  args: [{
    name: "page",
    description: "Page number",
    required: false,
  }],
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

    const page = parseInt(args[0]) || 1;
    const charactersPerPage = 500;
    const itemsPerPage = 3;
    let msg = `[หน้า ${page}/${Math.ceil(songQueue.length / itemsPerPage)}] `;

    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const songs = songQueue.slice(start, end);
    const songList = songs
      .map((song, index) => {
        const songIndex = start + index + 1;
        if (songIndex === 1) return;
        return `${songIndex - 1}. ${song.song.title} (${song.user})`;
      })
      .join(" | ");

    msg += songList;

    // Check if there are more songs
    if (songQueue.length > end) {
      msg += ` (...และอีก ${songQueue.length - end} เพลง)`;
    }

    // Check if the message exceeds the character limit
    if (msg.length > charactersPerPage) {
      msg = msg.slice(0, charactersPerPage - 3) + "...";
    }

    await client.chat.say(meta.channel, msg);
  }
}
