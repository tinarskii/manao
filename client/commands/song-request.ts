import { ApiClient } from "@twurple/api";
import { ChatClient } from "@twurple/chat";
import { CommandList } from "../types";
import { songQueue } from "../services/chat";
import YouTube from "youtube-sr";
import ytdl from "@distube/ytdl-core";

export default {
  name: "song-request",
  description: "Request a song",
  alias: ["sr"],
  args: [
    {
      name: "song",
      description: "The song you want to request",
      required: true,
    },
  ],
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

    // Check if it's already in queue
    for (let i = 0; i < songQueue.length; i++) {
      if (songQueue[i].song.id === songInfo.videoDetails.videoId) {
        await client.chat.say(
          meta.channel,
          `@${meta.user} เพลงนี้อยู่ในคิวแล้ว (คิวที่ ${i + 1})`,
        );
        return;
      }
    }

    let songData = {
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

    await client.chat.say(
      meta.channel,
      `@${meta.user} เพิ่มเพลง "${songInfo.videoDetails.title}" โดย ${songInfo.videoDetails.author.name} เป็นคิวที่ ${songQueue.length}`,
    );
  },
};
