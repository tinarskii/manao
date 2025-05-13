import { ApiClient } from "@twurple/api";
import { ChatClient } from "@twurple/chat";
import { CommandMeta } from "../types";
import { songQueue } from "../services/chat";
import YouTube from "youtube-sr";
import ytdl from "@distube/ytdl-core";
import { t } from "../helpers/i18n";

export default {
  name: { en: "song-request", th: "ขอเพลง" },
  description: { en: "Request a song", th: "ขอเพลงที่ต้องการ" },
  aliases: { en: ["sr"], th: ["ข", "ขอ"] },
  args: [
    {
      name: { en: "song", th: "เพลง" },
      description: {
        en: "The song you want to request",
        th: "เพลงที่คุณต้องการขอ",
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
    const song = args.join(" ");
    const songURL = song.match(
      /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|live\/|v\/)?)([\w\-]+)(\S+)?$/,
    )
      ? song
      : (await YouTube.search(song, { limit: 1, type: "video" }))[0].url;

    // Check if  songURL is playlist
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

    // Check if it's already in queue
    for (let i = 0; i < songQueue.length; i++) {
      if (songQueue[i].song.id === songInfo.videoDetails.videoId) {
        await client.chat.say(
          meta.channel,
          `@${meta.user} ${t("song.errorSongAlreadyInQueue", meta.lang, i + 1)}`,
        );
        return;
      }
    }

    const songData = {
      user: meta.user,
      song: {
        title: songInfo.videoDetails.title,
        author: songInfo.videoDetails.author.name,
        thumbnail: songInfo.videoDetails.thumbnails[0].url,
        id: songInfo.videoDetails.videoId,
      },
    };

    songQueue.push(songData);

    client.io.emit("songRequest", {
      index: songQueue.length - 1,
      queue: songQueue,
    });

    // Determine queue position message
    const queuePosition =
      songQueue.length - 1 === 0
        ? t("song.songCurrentlyPlaying", meta.lang)
        : t("song.queueAt", meta.lang, songQueue.length - 1);

    await client.chat.say(
      meta.channel,
      `@${meta.user} ${t("song.songAdded", meta.lang, songInfo.videoDetails.title, songInfo.videoDetails.author.name, queuePosition)}`,
    );
  },
};
