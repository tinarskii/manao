import { ApiClient } from "@twurple/api";
import { ChatClient } from "@twurple/chat";
import { CommandMeta } from "../types";
import { t } from "../../helpers/i18n";

export default {
  name: { en: "game", th: "เกม" },
  description: { en: "Change the stream's game", th: "เปลี่ยนเกมของสตรีม" },
  aliases: { en: ["g"], th: [] },
  args: [
    {
      name: { en: "game", th: "เกม" },
      description: {
        en: "The game you want to change to",
        th: "เกมที่คุณต้องการเปลี่ยนไป",
      },
      required: false,
    },
  ],
  modsOnly: true,
  execute: async (
    client: { api: ApiClient; chat: ChatClient; io: any },
    meta: CommandMeta,
    message: string,
    args: Array<string>,
  ) => {
    if (!args[0]) {
      const currentGame = (await client.api.channels.getChannelInfoById(
        meta.channelID,
      ))!;
      await client.chat.say(
        meta.channel,
        `เกมปัจจุบันคือ ${currentGame.gameName}`,
      );
      return;
    }
    // Get game id
    const game = await client.api.games.getGameByName(args.join(" "));
    if (!game) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("configuration.errorGameNotFound", meta.lang, args.join(" "))}`,
      );
      return;
    }

    // Get channel ID
    await client.api.channels.updateChannelInfo(meta.channelID, {
      gameId: game.id,
    });

    await client.chat.say(
      meta.channel,
      `@${meta.user} ${t("configuration.currentGameChanged", meta.lang, game.name)}`,
    );
  },
};
