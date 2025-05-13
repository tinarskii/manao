import { ApiClient } from "@twurple/api";
import { ChatClient } from "@twurple/chat";
import { CommandMeta } from "../types";
import { songQueue } from "../services/chat";
import { t } from "../helpers/i18n";

export default {
  name: { en: "song-skip", th: "ข้ามเพลง" },
  description: { en: "Skip a song", th: "ข้ามเพลงปัจจุบัน" },
  aliases: { en: ["skip", "sk"], th: ["ช้าม"] },
  execute: async (
    client: { api: ApiClient; chat: ChatClient; io: any },
    meta: CommandMeta,

    message: string,
    args: Array<string>,
  ) => {
    // Check if there is a song to skip
    if (songQueue.length === 0) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("song.queueEmpty", meta.lang)}`,
      );
      return;
    }

    // Check if user has permission to skip song (Requester or Mod)
    if (songQueue[0].user !== meta.user) {
      const isMod = await client.api.moderation.checkUserMod(
        meta.channelID,
        meta.userID,
      );
      if (!isMod && songQueue[0].user !== Bun.env.TW_CHANNEL) {
        await client.chat.say(
          meta.channel,
          `@${meta.user} ${t("song.errorSongRemovedNoPermission", meta.lang)}`,
        );
        return;
      }
    }

    const skippedSong = songQueue[0];
    const songTitle = skippedSong.song.title;

    songQueue.shift();
    client.io.emit("songSkip", songQueue);

    // Determine queue status message
    const queueStatus =
      songQueue.length === 0
        ? t("song.queueEmpty", meta.lang)
        : t("song.queueLength", meta.lang, songQueue.length);

    await client.chat.say(
      meta.channel,
      `@${meta.user} ${t("song.songSkipped", meta.lang, 1, songTitle, queueStatus)}`,
    );
  },
};
