import { ApiClient } from "@twurple/api";
import { ChatClient } from "@twurple/chat";
import { CommandMeta } from "../../types";
import { songQueue } from "../services/chat";
import { t } from "../../helpers/i18n";

export default {
  name: { en: "song-playing", th: "เพลงปัจจุบัน" },
  description: {
    en: "Display the currently playing song",
    th: "แสดงเพลงที่กำลังเล่นอยู่",
  },
  aliases: { en: ["playing", "nowplaying", "np"], th: ["เพลงอะไร", "เพลงไร"] },
  execute: async (
    client: { api: ApiClient; chat: ChatClient; io: any },
    meta: CommandMeta,
  ) => {
    // Check if there is a song currently playing
    if (songQueue.length === 0) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("song.queueEmpty", meta.lang)}`,
      );
      return;
    }

    const [currentSong] = songQueue;
    const songTitle = currentSong.song.title;
    const songAuthor = currentSong.song.author;
    const songUser = currentSong.user;

    // Determine queue status message
    const queueStatus =
      songQueue.length - 1 === 0
        ? t("song.queueEmpty", meta.lang)
        : t("song.queueLength", meta.lang, songQueue.length - 1);

    await client.chat.say(
      meta.channel,
      `@${meta.user} ${t("song.songPlaying", meta.lang, songTitle, songAuthor, songUser)} (${queueStatus})`,
    );
  },
};
