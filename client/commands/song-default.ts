import { ApiClient } from "@twurple/api";
import { ChatClient } from "@twurple/chat";
import { CommandMeta } from "../../types";
import { db } from "../../helpers/database";
import { t } from "../../helpers/i18n";
import {
  getYouTubeVideoInfo,
  isPlaylistUrl,
  searchYouTube,
} from "../../helpers/youtube";

export default {
  name: { en: "song-default", th: "เพลงเริ่มต้น" },
  description: { en: "Set a default song(s)", th: "ตั้งเพลงเริ่มต้น" },
  aliases: { en: ["sd"], th: ["เพลงเริ่ม"] },
  args: [
    {
      name: { en: "song(s)", th: "เพลง" },
      description: {
        en: "The song(s) you want to set as default, separated by commas (,)",
        th: "เพลงที่คุณต้องการตั้งเป็นเพลงเริ่มต้น, คั่นด้วยเครื่องหมายคอมม่า (,)",
      },
      required: true,
    },
  ],
  broadcasterOnly: true,
  execute: async (
    client: { api: ApiClient; chat: ChatClient; io: any },
    meta: CommandMeta,
    message: string,
    args: string[],
  ) => {
    const songs = args
      .join(" ")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (songs.length === 0) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("song.errorSongNotFound", meta.lang)}`,
      );
      return;
    }

    const validInfos = [];
    for (const song of songs) {
      const result = await searchYouTube(song);
      if (!result || isPlaylistUrl(result.url)) continue;
      const info = await getYouTubeVideoInfo(result.videoId);
      if (!info || info.lengthSeconds > 600 || info.isLiveContent) continue;
      validInfos.push(info);
    }

    if (validInfos.length === 0) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("song.errorSongNotFound", meta.lang)}`,
      );
      return;
    }

    const songsData = validInfos.map((info) => ({
      songTitle: info.title,
      songAuthor: info.author,
      songThumbnail: info.thumbnail,
      songID: info.videoId,
    }));

    db.prepare(
      "INSERT OR REPLACE INTO preferences (userID, defaultSong) VALUES (?, ?)",
    ).run(Number(Bun.env.BROADCASTER_ID), JSON.stringify(songsData));

    await client.chat.say(
      meta.channel,
      `@${meta.user} ${t("song.songDefault", meta.lang, songsData.length)}`,
    );
  },
};
