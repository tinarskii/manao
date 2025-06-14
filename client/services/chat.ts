import { ChatClient } from "@twurple/chat";
import { ApiClient } from "@twurple/api";
import { RefreshingAuthProvider } from "@twurple/auth";
import { logger } from "../../helpers/logger";
import { readdirSync } from "fs";
import { join } from "node:path";
import { handleMessage } from "../handlers/messageHandler";
import { Command, CommandList, SongRequestData } from "../../types";
import { fetchCommand } from "../../helpers/database";
import { getDisabledCommands } from "../../helpers/preferences";

// Global command storage
export const commands: CommandList = new Map();
export const customCommands: CommandList = fetchCommand();
export const songQueue: Array<SongRequestData> = [];

/**
 * Initializes the Twitch chat client and API client
 */
export async function initializeChatClient(
  authProvider: RefreshingAuthProvider,
) {
  const apiClient = new ApiClient({ authProvider });

  const chatClient = new ChatClient({
    authProvider,
    channels: [process.env.TW_CHANNEL ?? "tinarskii"],
  });

  // Connect to chat
  chatClient.connect();

  chatClient.onConnect(async () => {
    await loadCommands();
    logger.info("[Chat] Connected to Twitch chat");
  });

  chatClient.onMessage(async (channel, user, message, msgObj) => {
    const userID = msgObj.userInfo.userId!;
    const channelID = msgObj.channelId!;

    await handleMessage(
      channel,
      user,
      message,
      msgObj,
      userID,
      channelID,
      chatClient,
      apiClient,
    );
  });

  return { chatClient, apiClient };
}

/**
 * Loads command modules from the commands directory
 * and maps each command name and its aliases in both languages.
 */
export async function loadCommands() {
  try {
    const commandsDir = join(import.meta.dir, "../commands");
    const commandFiles = readdirSync(commandsDir).filter(
      (file) => file.endsWith(".ts") || file.endsWith(".js"),
    );

    for (const file of commandFiles) {
      const command: Command = (await import(join(commandsDir, file))).default;

      // Register command using all possible names/aliases in both languages
      const allNames = [command.name.en].filter(Boolean);

      for (const name of allNames) {
        commands.set(name.toLowerCase(), command);
      }

      // Check if command is disabled
      if (getDisabledCommands().includes(command.name.en)) {
        command.disabled = true;
      }

      logger.info(`[Commands] Loaded command: ${command.name.en}`);
    }

    logger.info(`[Commands] Loaded ${commands.size} command mappings`);
  } catch (error) {
    logger.error(`[Commands] Failed to load commands: ${error}`);
    throw error;
  }
}
