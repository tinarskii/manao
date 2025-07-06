import { ChatClient } from "@twurple/chat";
import { ApiClient } from "@twurple/api";
import { commands, customCommands } from "../services/chat";
import { logger } from "../../helpers/logger";
import { io } from "../../server";
import { getCurrency, getLang } from "../../helpers/preferences";
import { t } from "../../helpers/i18n";
import { closest } from "../../helpers/levenshtein";
import { findCommand } from "../../helpers/command";
import { addBalance, getBalance, getNickname, setBalance, subtractBalance } from "../../helpers/database";

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

    const command = findCommand(commands, inputCommand);
    const customCommand = findCommand(customCommands, inputCommand);

    if (!command && !customCommand) {
      // Check for the closest command match
      let inputLang = /[^\u0000-\u007F]/.test(inputCommand)
        ? "th"
        : ("en" as "en" | "th");
      const closestCommand = closest(
        inputCommand,
        [...commands.values(), ...customCommands.values()].map(
          (c) => c.name[inputLang],
        ),
      );
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

    if (command) {
      if (command.disabled) return;
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
        const isMod = await apiClient.moderation.checkUserMod(
          channelID,
          userID,
        );
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
    } else if (customCommand) {
      // Verify broadcaster permissions for custom commands
      if (customCommand.broadcasterOnly && userID !== channelID) {
        await chatClient.say(
          channel,
          `@${user}, ${t("command.errorBroadcasterOnly", lang)}`,
        );
        return;
      }

      // Verify moderator permission for custom commands
      if (customCommand.modsOnly) {
        const isMod = await apiClient.moderation.checkUserMod(
          channelID,
          userID,
        );
        if (!isMod && userID !== channelID) {
          await chatClient.say(
            channel,
            `@${user}, ${t("command.errorModeratorOnly", lang)}`,
          );
          return;
        }
      }

      // Verify required arguments for custom commands
      if (customCommand.args) {
        const requiredArgs = customCommand.args.filter((arg) => arg.required);
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

      const sendMessage = (message: string) => { return chatClient.say(channel, message); };
      const getInput = (index: number | null) => {
        if (!index) return args.join(" ")
        else return args[index - 1];
      }

      const context = {
        client: {
          chat: chatClient,
          io,
          api: apiClient,
        },
        meta: {
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
        sendMessage,
        getInput,
        getBalance,
        addBalance,
        subtractBalance,
        setBalance
      };

      const script = String(customCommand.execute);

      const executeCommand = new Function(
        "context",
        `const { client, meta, message, args, sendMessage, getInput, getBalance, addBalance, subtractBalance, setBalance } = context;
         ${script}
        `,
      );

      await executeCommand(context);

      logger.info(`[Custom Command] Executed: ${inputCommand} by ${user}`);
    }
  } catch (error) {
    await chatClient.say(
      channel,
      `@${user}, ${t("command.errorCommandHandler", lang)}`,
    );
    logger.error(`[Command] Error executing ${message}:`);
    console.log(error);
  }
}
