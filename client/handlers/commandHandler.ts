import { ChatClient } from "@twurple/chat";
import { ApiClient } from "@twurple/api";
import { commands } from "../services/chat";
import { logger } from "../helpers/logger";
import { io } from "../../server/server";

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
  apiClient: ApiClient
) {
  try {
    const args = message.split(" ").slice(1);
    let commandName = message.split(" ")[0].slice(1);

    // Check for command aliases
    for (const command of commands.values()) {
      if ((command.alias || []).includes(commandName)) {
        commandName = command.name;
        break;
      }
    }

    const command = commands.get(commandName);
    if (!command) return;

    // Verify broadcaster permission
    if (command.broadcasterOnly && userID !== channelID) {
      await chatClient.say(channel, `เฉพาะผู้ถือสิทธิเท่านั้น!!!!!!!!!!!!`);
      return;
    }

    // Verify moderator permission
    if (command.modsOnly) {
      const isMod = await apiClient.moderation.checkUserMod(channelID, userID);
      if (!isMod && userID !== channelID) {
        await chatClient.say(channel, `เฉพาะดาบเท่านั้น!!!!!!!!!!!!`);
        return;
      }
    }

    // Verify required arguments
    if ((command.args?.length || 0) > args.length && command.args) {
      const requiredArgs = command.args.filter((arg) => arg.required);
      if (requiredArgs.length) {
        const requiredArgsString = requiredArgs
          .map((arg) => arg.name)
          .join(", ");
        await chatClient.say(
          channel,
          `ใส่อาร์กิวเมนต์ให้ครบ ต้องการ: ${requiredArgsString}`,
        );
        return;
      }
    }

    // Execute the command
    command.execute(
      { chat: chatClient, io, api: apiClient },
      { channel, channelID, user, userID, commands },
      message,
      args,
    );

    logger.info(`[Command] Executed: ${commandName} by ${user}`);
  } catch (error) {
    await chatClient.say(channel, "มึงทำบอตพัง");
    logger.error(`[Command] Error executing ${message}:`, error);
  }
}