import { ChatClient } from "@twurple/chat";
import { ApiClient } from "@twurple/api";
import { commands, currentLang } from "../services/chat";
import { logger } from "../helpers/logger";
import { io } from "../../server";
import { getCurrency } from "../helpers/preference";
import { t } from "../helpers/i18n";

/**
 * Processes a chat command
 */
export async function handleCommand(
  channel: string,
  user: string,
  userID: string,
  channelID: string,
  message: string,
  chatClient: ChatClient,
  apiClient: ApiClient,
) {
  let lang = currentLang();
  try {
    const args = message.split(" ").slice(1);
    let commandName = message.split(" ")[0].slice(1);

    for (const command of commands.values()) {
      if (
        (command.aliases?.en || []).includes(commandName) ||
        (command.aliases?.th || []).includes(commandName)
      ) {
        // @ts-ignore
        commandName = command.name.en;
        break;
      }
    }

    const command = commands.get(commandName);
    if (!command) return;

    // Verify broadcaster permission
    if (command.broadcasterOnly && userID !== channelID) {
      await chatClient.say(channel, `@${user}, ${t("command.errorBroadcasterOnly", lang)}`);
      return;
    }

    // Verify moderator permission
    if (command.modsOnly) {
      const isMod = await apiClient.moderation.checkUserMod(channelID, userID);
      if (!isMod && userID !== channelID) {
        await chatClient.say(channel, `@${user}, ${t("command.errorModeratorOnly", lang)}`);
        return;
      }
    }

    // Verify required arguments
    if (command.args) {
      const requiredArgs = command.args.filter((arg) => arg.required);
      const missingArgs = requiredArgs.filter((arg, index) => !args[index]);
      if (missingArgs.length > 0) {
        const missingArgsNames = missingArgs.map((arg) => arg.name[lang]).join(", ");
        await chatClient.say(channel, `@${user}, ${t("command.errorArgsRequired", lang, missingArgsNames)}`);
        return;
      }
    }

    // Execute the command
    command.execute(
      { chat: chatClient, io, api: apiClient },
      { channel, channelID, user, userID, commands, lang: currentLang() ?? "en", currency: getCurrency() ?? "KEEB" },
      message,
      args,
    );

    logger.info(`[Command] Executed: ${commandName} by ${user}`);
  } catch (error) {
    await chatClient.say(channel, `@${user}, ${t("command.errorCommandHandler", lang)}`);
    logger.error(`[Command] Error executing ${message}:`, error);
  }
}
