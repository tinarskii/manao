import { ApiClient } from "@twurple/api";
import { ChatClient } from "@twurple/chat";
import { CommandMeta } from "../types";
import { logger } from "../helpers/logger";
import { t } from "../helpers/i18n";

export default {
  name: { en: "uptime", th: "เวลาสตรีม" },
  description: {
    en: "Get the current uptime of the stream",
    th: "ตรวจสอบระยะเวลาที่สตรีมเปิดอยู่",
  },
  execute: async (
    client: { api: ApiClient; chat: ChatClient; io: any },
    meta: CommandMeta,

    _: string,
    args: Array<string>,
  ) => {
    // Get the stream info
    const stream = await client.api.streams.getStreamByUserId(meta.channelID);

    // Check if the stream is live
    if (!stream) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("info.offline", meta.lang)}`,
      );
      return;
    }

    // Get the uptime
    const uptime = stream.startDate;
    const now = new Date();
    const diff = now.getTime() - uptime.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const formattedUptime = [
      days > 0 ? `${days} วัน` : "",
      hours > 0 ? `${hours % 24} ${t( "info.hours", meta.lang)}` : "",
      minutes > 0 ? `${minutes % 60} ${t("info.minutes", meta.lang)}` : "",
      seconds > 0 ? `${seconds % 60} ${t("info.seconds", meta.lang)}` : "",
    ]
      .filter(Boolean)
      .join(" ");

    await client.chat.say(
      meta.channel,
      `@${meta.user} ${t("info.uptime", meta.lang, formattedUptime)}`,
    );
  },
};
