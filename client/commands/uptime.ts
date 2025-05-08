import { ApiClient } from "@twurple/api";
import { ChatClient } from "@twurple/chat";
import { CommandList } from "../types";
import { logger } from "../helpers/logger";

export default {
  name: "uptime",
  description: "Get the current uptime of the stream",
  execute: async (
    client: { api: ApiClient; chat: ChatClient; io: any },
    meta: {
      user: string;
      channel: string;
      channelID: string;
      userID: string;
      commands: CommandList;
    },
    _: string,
    args: Array<string>,
  ) => {
    // Get the stream info
    const stream = await client.api.streams.getStreamByUserId(meta.channelID);

    // Check if the stream is live
    if (!stream) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} สตรีมนี้ไม่ได้ออนไลน์อยู่`,
      );
      return;
    }

    // Get the uptime
    const uptime = stream.startDate
    const now = new Date();
    const diff = now.getTime() - uptime.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const formattedUptime = [
      days > 0 ? `${days} วัน` : "",
      hours > 0 ? `${hours % 24} ชั่วโมง` : "",
      minutes > 0 ? `${minutes % 60} นาที` : "",
      seconds > 0 ? `${seconds % 60} วินาที` : "",
    ]
      .filter(Boolean)
      .join(" ");

    await client.chat.say(
      meta.channel,
      `@${meta.user} สตรีมนี้ออนไลน์มาแล้ว ${formattedUptime}`,
    );
  },
};
