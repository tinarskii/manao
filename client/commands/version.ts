import { ApiClient } from "@twurple/api";
import { ChatClient } from "@twurple/chat";
import { CommandList } from "../types";
import { version } from "../../package.json";
import { version as twurpleVersion } from "@twurple/api/package.json";

export default {
  name: "version",
  description: "Check bot's current version",
  alias: ["v", "ver"],
  execute: async (
    client: { api: ApiClient; chat: ChatClient; io: any },
    meta: {
      user: string;
      channel: string;
      channelID: string;
      userID: string;
      commands: CommandList;
    },
  ) => {
    const MANAO_VERSION = version;
    const BUN_VERSION = Bun.version;
    const TWURPLE_VERSION = twurpleVersion;

    await client.chat.say(
      meta.channel,
      `@${meta.user} Manaobot v${MANAO_VERSION} using Twurple v${TWURPLE_VERSION} running on Bun v${BUN_VERSION}`,
    );
  },
};
