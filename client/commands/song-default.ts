import { ApiClient } from "@twurple/api";
import { ChatClient } from "@twurple/chat";
import { CommandMeta } from "../types";
import YouTube from "youtube-sr";
import ytdl from "@distube/ytdl-core";
import { db } from "../helpers/database";
import { t } from "../helpers/i18n";

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
    args: Array<string>,
  ) => {
    // Accept 2 types of input:
    // 1. A List of YouTube URL e.g. url1, url2, url3,... urlN
    // 2. A song name to search on YouTube e.g. song query 1, song query 2, song query 3... song query N
    const songs = args.join(" ").split(",").map((song) => song.trim());
    if (songs.length === 0) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("song.errorSongNotFound", meta.lang)}`,
      );
      return;
    }

    // songURLs
    const songURLs = await Promise.all(
      songs.map(async (song) => {
        // Check if the song is a valid YouTube URL
        const urlRegex = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|live\/|v\/)?)([\w\-]+)(\S+)?$/;
        if (urlRegex.test(song)) {
          return song; // It's a valid URL
        } else {
          // Search for the song on YouTube
          const searchResult = await YouTube.search(song, { limit: 1, type: "video" });
          return searchResult.length > 0 ? searchResult[0].url : null; // Return the first result or null if not found
        }
      }),
    );

    // Filter out any null values (songs not found)
    const validSongURLs = songURLs.filter((url) => url !== null);
    if (validSongURLs.length === 0) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("song.errorSongNotFound", meta.lang)}`,
      );
      return;
    }

    // Check for playlists
    if (validSongURLs.some((url) => url.match(/playlist/))) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("song.errorSongRequestPlaylist", meta.lang)}`,
      );
      return;
    }

    const songsInfo = await Promise.all(
      validSongURLs.map((url) => ytdl.getInfo(url).catch(() => null)),
    );

    // If song was not found
    if (songsInfo.some((info) => info === null)) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("song.errorSongNotFound", meta.lang)}`,
      );
      return;
    }

    // Check if the songs are longer than 10 minutes
    if (songsInfo.some((info) => Number(info.videoDetails.lengthSeconds) > 600)) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("song.errorSongTooLong", meta.lang)}`,
      );
      return;
    }

    // Check if the songs are not live
    if (songsInfo.some((info) => info.videoDetails.isLiveContent)) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("song.errorSongIsLive", meta.lang)}`,
      );
      return;
    }

    // songsData array
    const songsData = songsInfo.map((info) => ({
      songTitle: info.videoDetails.title,
      songAuthor: info.videoDetails.author.name,
      songThumbnail: info.videoDetails.thumbnails[0].url,
      songID: info.videoDetails.videoId,
    }));

    const stmt = db.prepare(
      "INSERT OR REPLACE INTO preferences (userID, defaultSong) VALUES (?, ?)",
    );
    stmt.run(Number(Bun.env.BROADCASTER_ID), JSON.stringify(songsData));

    await client.chat.say(
      meta.channel,
      `@${meta.user} ${t("song.songDefault", meta.lang, songsData.length)}`,
    );
  },
};
