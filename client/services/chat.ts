import { ChatClient } from "@twurple/chat";
import { ApiClient } from "@twurple/api";
import { RefreshingAuthProvider } from "@twurple/auth";
import { logger } from "../../helpers/logger";
import { handleMessage } from "../handlers/messageHandler";
import { Command, CommandList, SongRequestData } from "../../types";
import { fetchCommand } from "../../helpers/database";
import { getDisabledCommands } from "../../helpers/preferences";
import { Glob } from "bun";
import { isProduction } from "../../server/config";

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
    channels: [Bun.env.TW_CHANNEL ?? "tinarskii"],
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
    const glob = new Glob("**/*");
    const allFiles = [];

    for (const file of glob.scanSync(".")) {
      if (file.startsWith("node_modules")) continue;
      allFiles.push(file);
    }

    const commandFiles = allFiles
      .filter(file =>
        (file.startsWith("client/commands/") || file.startsWith("client\\commands\\")) &&
        (file.endsWith(".ts") || file.endsWith(".js"))
      )
      .map(file => {
        // Normalize path separators and remove directory + extension
        return file
          .replace(/client[\/\\]commands[\/\\]/, "") // Remove directory with either separator
          .replace(/\.(ts|js)$/, ""); // Remove extension
      });

    for (const cmdFile of commandFiles) {
      const filePath = isProduction ? `./client/commands/${cmdFile}` : `../commands/${cmdFile}`;
      const command: Command = (await import(filePath)).default;

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
