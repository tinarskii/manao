import { ApiClient } from "@twurple/api";
import { ChatClient } from "@twurple/chat";
import { CommandMeta } from "../types";
import { songQueue } from "../services/chat";
import { t } from "../helpers/i18n";

export default {
  name: { en: "song-remove", th: "ลบเพลง" },
  description: { en: "Remove a song", th: "ลบเพลงออกจากคิว" },
  aliases: { en: ["remove", "rm"], th: ["ลบ"] },
  args: [
    {
      name: { en: "index", th: "ลำดับ" },
      description: {
        en: "The index of the song to remove",
        th: "ลำดับของเพลงที่ต้องการลบ",
      },
      required: true,
    },
  ],
  execute: async (
    client: { api: ApiClient; chat: ChatClient; io: any },
    meta: CommandMeta,

    message: string,
    args: Array<string>,
  ) => {
    const index = parseInt(args[0]);
    if (isNaN(index) || index <= 0 || index >= songQueue.length) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("song.errorSongIndex", meta.lang)}`,
      );
      return;
    }

    // Check if user has permission to remove song (Requester or Mod)
    if (songQueue[index].user !== meta.user) {
      const isMod = await client.api.moderation.checkUserMod(
        meta.channelID,
        meta.userID,
      );
      if (!isMod && songQueue[index].user !== Bun.env.TW_CHANNEL) {
        await client.chat.say(
          meta.channel,
          `@${meta.user} ${t("song.errorSongRemovedNoPermission", meta.lang)}`,
        );
        return;
      }
    }

    const songTitle = songQueue[index].song.title;

    songQueue.splice(index, 1);
    client.io.emit("songQueue", songQueue);

    // Determine queue status message
    const queueStatus =
      songQueue.length - 1 === 0
        ? t("song.queueEmpty", meta.lang)
        : t("song.queueLength", meta.lang, songQueue.length - 1);

    await client.chat.say(
      meta.channel,
      `@${meta.user} ${t("song.songRemoved", meta.lang, index, songTitle, queueStatus)}`,
    );
  },
};
