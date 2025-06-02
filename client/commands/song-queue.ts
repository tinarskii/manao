import { ApiClient } from "@twurple/api";
import { ChatClient } from "@twurple/chat";
import { CommandMeta } from "../types";
import { songQueue } from "../services/chat";
import { t } from "../../helpers/i18n";

export default {
  name: { en: "song-queue", th: "คิวเพลง" },
  description: { en: "Check song queue", th: "ตรวจสอบคิวเพลง" },
  aliases: { en: ["queue", "sq"], th: ["คิว"] },
  args: [
    {
      name: { en: "page", th: "หน้า" },
      description: { en: "Page number", th: "หมายเลขหน้า" },
      required: false,
    },
  ],
  execute: async (
    client: { api: ApiClient; chat: ChatClient; io: any },
    meta: CommandMeta,

    message: string,
    args: Array<string>,
  ) => {
    if (songQueue.length === 0) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("song.queueEmpty", meta.lang)}`,
      );
      return;
    }

    const page = parseInt(args[0]) || 1;
    const charactersPerPage = 500;
    const itemsPerPage = 3;
    const totalPages = Math.ceil(songQueue.length / itemsPerPage);

    let msg = `${t("song.queuePageTitle", meta.lang, page, totalPages)} `;

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
      msg += ` ${t("song.queuePageFooter", meta.lang, songQueue.length - end)}`;
    }

    // Check if the message exceeds the character limit
    if (msg.length > charactersPerPage) {
      msg = `${msg.slice(0, charactersPerPage - 3)}...`;
    }

    await client.chat.say(meta.channel, msg);
  },
};
