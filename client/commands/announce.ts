import { ApiClient } from "@twurple/api";
import { ChatClient } from "@twurple/chat";
import { CommandList } from "../types";
import { logger } from "../helpers/logger";

export default {
  name: "announce",
  description: "Announce something!",
  alias: ["a"],
  args: [
    {
      name: "message",
      description: "The message you want to announce",
      required: true,
    },
  ],
  modsOnly: true,
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
    const message = args.join(" ");

    try {
      await client.api.chat.sendAnnouncement(meta.channelID, {
        message,
      });
    } catch (e) {
      logger.error(e);
      await client.chat.say(
        meta.channel,
        `@${meta.user} ไม่สามารถ announce ได้`,
      );
      return;
    }
  },
};
