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
      name: { en: "action", th: "คำสั่ง" },
      description: {
        en: "The action to perform (should be: set, add)",
        th: "คำสั่งที่ต้องการทำ (ควรเป็น: set, add)",
      },
      required: true,
    },
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
    const action = args[0]?.toLowerCase();

    if (action !== "set" && action !== "add") {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("song.errorInvalidAction", meta.lang)}`,
      );
      return;
    }

    const songs = args
      .slice(1)
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

    if (action === "set") {
      db.prepare(
        "INSERT OR REPLACE INTO preferences (userID, defaultSong) VALUES (?, ?)",
      ).run(Number(Bun.env.BROADCASTER_ID), JSON.stringify(songsData));
    } else if (action === "add") {
      const existingData = db
        .prepare("SELECT defaultSong FROM preferences WHERE userID = ?")
        .get(Number(Bun.env.BROADCASTER_ID)) as { defaultSong: string } | undefined;
      const existingSongs = existingData
        ? JSON.parse(existingData.defaultSong)
        : [];
      const updatedSongs = [...existingSongs, ...songsData];
      db.prepare(
        "INSERT OR REPLACE INTO preferences (userID, defaultSong) VALUES (?, ?)",
      ).run(Number(Bun.env.BROADCASTER_ID), JSON.stringify(updatedSongs));
    }

    await client.chat.say(
      meta.channel,
      `@${meta.user} ${t("song.songDefault", meta.lang, songsData.length)}`,
    );
  },
};
