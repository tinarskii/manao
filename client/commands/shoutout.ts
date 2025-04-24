import { ApiClient } from "@twurple/api";
import { ChatClient } from "@twurple/chat";
import { CommandList } from "../types";

export default {
  name: "shoutout",
  description: "Shoutout to someone!",
  alias: ["so"],
  args: [
    {
      name: "user",
      description: "The user you want to shoutout",
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
    let userID = (await client.api.users.getUserByName(args[0]))?.id;

    if (!userID) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ไม่พบผู้ใช้ ${args[0]}`,
      );
      return;
    }

    try {
      await client.api.chat.shoutoutUser(meta.channelID, userID);
    } catch (e) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ไม่สามารถ shoutout ได้`,
      );
      return;
    }
    await client.chat.say(
      meta.channel,
      `@${meta.user} ทุกคนมากดฟอลให้ @${args[0]} กันนะ!`,
    );
  },
};
