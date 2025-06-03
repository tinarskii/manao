import { ChatClient } from "@twurple/chat";
import { ApiClient } from "@twurple/api";
import { commands, customCommands } from "../services/chat";
import { logger } from "../../helpers/logger";
import { io } from "../../server";
import { getCurrency, getLang } from "../../helpers/preferences";
import { t } from "../../helpers/i18n";
import { Command, CommandList } from "../../types";
import { closest } from "../../helpers/levenshtein";

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
  const lang = getLang();
  try {
    const args = message.split(" ").slice(1);
    const inputCommand = message.split(" ")[0].slice(1);

    /**
     * Finds a command by checking name and aliases in both languages
     * @param {CommandList} commandMap The command collection to search
     * @param {string} searchTerm The command name/alias to find
     * @returns {Command|null} Found command object or null
     */
    function findCommand(commandMap: CommandList, searchTerm: string): Command | null {
      for (const command of commandMap.values()) {
        // Check exact name matches first (most common case)
        if (command.name.en === searchTerm || command.name.th === searchTerm) {
          return command;
        }

        // Check aliases if they exist
        const enAliases = command.aliases?.en || [];
        const thAliases = command.aliases?.th || [];

        if (enAliases.includes(searchTerm) || thAliases.includes(searchTerm)) {
          return command;
        }
      }
      return null;
    }

    const command = findCommand(commands, inputCommand) || findCommand(customCommands, inputCommand);

    if (!command) {
      // Check for the closest command match
      let inputLang = /[^\u0000-\u007F]/.test(inputCommand) ? "th" : "en" as "en" | "th";
      const closestCommand = closest(inputCommand, [...commands.values(), ...customCommands.values()].map(c => c.name[inputLang]));
      if (closestCommand) {
        await chatClient.say(
          channel,
          `@${user}, ${t("command.errorCommandNotFound", lang, inputCommand, closestCommand)}`,
        );
      } else {
        return;
      }
      return;
    }

    // Verify broadcaster permissions
    if (command.broadcasterOnly && userID !== channelID) {
      await chatClient.say(
        channel,
        `@${user}, ${t("command.errorBroadcasterOnly", lang)}`,
      );
      return;
    }

    // Verify moderator permission
    if (command.modsOnly) {
      const isMod = await apiClient.moderation.checkUserMod(channelID, userID);
      if (!isMod && userID !== channelID) {
        await chatClient.say(
          channel,
          `@${user}, ${t("command.errorModeratorOnly", lang)}`,
        );
        return;
      }
    }

    // Verify required arguments
    if (command.args) {
      const requiredArgs = command.args.filter((arg) => arg.required);
      const missingArgs = requiredArgs.filter((_, index) => !args[index]);
      if (missingArgs.length > 0) {
        const missingArgsNames = missingArgs
          .map((arg) => arg.name[lang])
          .join(", ");
        await chatClient.say(
          channel,
          `@${user}, ${t("command.errorArgsRequired", lang, missingArgsNames)}`,
        );
        return;
      }
    }

    // Execute the command
    command.execute(
      { chat: chatClient, io, api: apiClient },
      {
        channel,
        channelID,
        user,
        userID,
        commands,
        lang: getLang() ?? "en",
        currency: getCurrency() ?? "KEEB",
      },
      message,
      args,
    );

    logger.info(`[Command] Executed: ${inputCommand} by ${user}`);
  } catch (error) {
    await chatClient.say(
      channel,
      `@${user}, ${t("command.errorCommandHandler", lang)}`,
    );
    logger.error(`[Command] Error executing ${message}:`, error);
  }
}
