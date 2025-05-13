import { ApiClient } from "@twurple/api";
import { ChatClient } from "@twurple/chat";
import { CommandMeta } from "../types";
import YouTube from "youtube-sr";
import ytdl from "@distube/ytdl-core";
import { db } from "../helpers/database";
import { t } from "../helpers/i18n";

export default {
  name: { en: "song-default", th: "เพลงเริ่มต้น" },
  description: { en: "Set a default song", th: "ตั้งเพลงเริ่มต้น" },
  aliases: { en: ["sd"], th: ["เพลงเริ่ม"] },
  args: [
    {
      name: { en: "song", th: "เพลง" },
      description: {
        en: "The song you want to set as default",
        th: "เพลงที่คุณต้องการตั้งเป็นเพลงเริ่มต้น",
      },
      required: true,
    },
  ],
  broadcasterOnly: true,
  execute: async (
    client: { api: ApiClient; chat: ChatClient; io: any },
    meta: CommandMeta,
    message: string,
    args: Array<string>,
  ) => {
    const song = args.join(" ");
    const songURL = song.match(
      /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|live\/|v\/)?)([\w\-]+)(\S+)?$/,
    )
      ? song
      : (await YouTube.search(song, { limit: 1, type: "video" }))[0].url;

    // Check if songURL is playlist
    if (songURL.match(/playlist/)) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("song.errorSongRequestPlaylist", meta.lang)}`,
      );
      return;
    }

    const songInfo = await ytdl.getInfo(songURL);

    // If song was not found
    if (!songInfo) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("song.errorSongNotFound", meta.lang)}`,
      );
      return;
    }

    // Check if the song is longer than 10 minutes
    if (Number(songInfo.videoDetails.lengthSeconds) > 600) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("song.errorSongTooLong", meta.lang)}`,
      );
      return;
    }

    // Check if the video is not live
    if (songInfo.videoDetails.isLiveContent) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("song.errorSongIsLive", meta.lang)}`,
      );
      return;
    }

    const songData = {
      songTitle: songInfo.videoDetails.title,
      songAuthor: songInfo.videoDetails.author.name,
      songThumbnail: songInfo.videoDetails.thumbnails[0].url,
      songID: songInfo.videoDetails.videoId,
    };

    const stmt = db.prepare(
      "INSERT OR REPLACE INTO preferences (userID, defaultSong) VALUES (?, ?)",
    );
    stmt.run(Number(Bun.env.BROADCASTER_ID), JSON.stringify(songData));

    await client.chat.say(
      meta.channel,
      `@${meta.user} ${t("song.songDefault", meta.lang, songData.songTitle, songData.songAuthor)}`,
    );
  },
};
