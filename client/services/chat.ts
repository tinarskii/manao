import { ChatClient } from "@twurple/chat";
import { ApiClient } from "@twurple/api";
import { RefreshingAuthProvider } from "@twurple/auth";
import { logger } from "../helpers/logger";
import { readdirSync } from "fs";
import { join } from "node:path";
import { handleMessage } from "../handlers/messageHandler";
import { CommandList } from "../types";

// Global command storage
export const commands: CommandList = new Map();
export let songQueue: any[] = [];

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
  await chatClient.connect();

  // On connect event
  chatClient.onConnect(async () => {
    await loadCommands();
    logger.info("[Chat] Connected to Twitch chat");
  });

  // Handle incoming chat messages
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
 */
async function loadCommands() {
  try {
    const commandsDir = join(__dirname, "../commands");
    const commandFiles = readdirSync(commandsDir).filter(
      (file) => file.endsWith(".ts") || file.endsWith(".js"),
    );

    for (const file of commandFiles) {
      const command = (await import(join(commandsDir, file))).default;
      commands.set(command.name, command);
      logger.info(`[Commands] Loaded command: ${command.name}`);
    }

    logger.info(`[Commands] Loaded ${commandFiles.length} commands`);
  } catch (error) {
    logger.error("[Commands] Failed to load commands:", error);
  }
}
