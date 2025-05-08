import { ApiClient } from "@twurple/api";
import { ChatClient } from "@twurple/chat";
import { CommandList } from "../types";
import YouTube from "youtube-sr";
import ytdl from "@distube/ytdl-core";
import { db } from "../helpers/database";

export default {
  name: "song-default",
  description: "Set a default song",
  alias: ["sd"],
  args: [
    {
      name: "song",
      description: "The song you want to set as default",
      required: true,
    },
  ],
  broadcasterOnly: true,
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
        `@${meta.user} ไม่สามารถเพิ่มเพลงจาก Playlist ได้`,
      );
      return;
    }

    const songInfo = await ytdl.getInfo(songURL);

    // If song was not found
    if (!songInfo) {
      await client.chat.say(meta.channel, `@${meta.user} ไม่เจอเพลง: ${song}`);
      return;
    }

    // Check if the song is longer than 10 minutes
    if (Number(songInfo.videoDetails.lengthSeconds) > 600) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} เพลงยาวเกิน 10 นาที ผมรับไม่ได้`,
      );
      return;
    }

    // Check if the video is not live
    if (songInfo.videoDetails.isLiveContent) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ต้องเป็นวิดิโอที่ไม่ได้ถูกถ่ายทอดสด`,
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
      `@${meta.user} ตั้งเพลง "${songData.songTitle}" โดย "${songData.songAuthor} เป็นเพลงเริ่มต้นแล้ว`,
    );
  },
};
