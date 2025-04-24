import { ApiClient } from "@twurple/api";
import { ChatClient } from "@twurple/chat";
import { CommandList } from "../client";

export default {
  name: "game",
  description: "Change the stream's game",
  alias: ["g"],
  args: [
    {
      name: "game",
      description: "The game you want to change to",
      required: false,
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
    message: string,
    args: Array<string>,
  ) => {
    if (!args[0]) {
      let currentGame = (await client.api.channels.getChannelInfoById(
        meta.channelID,
      ))!;
      await client.chat.say(
        meta.channel,
        `เกมปัจจุบันคือ ${currentGame.gameName}`,
      );
      return;
    }
    // Get game id
    let game = await client.api.games.getGameByName(args.join(" "));
    if (!game) {
      await client.chat.say(meta.channel, `@${meta.user} ไม่พบเกม ${args[0]}`);
      return;
    }

    // Get channel ID
    await client.api.channels.updateChannelInfo(meta.channelID, {
      gameId: game.id,
    });

    await client.chat.say(
      meta.channel,
      `@${meta.user} เปลี่ยนเกมเป็น ${game.name} แล้ว!`,
    );
  },
};
