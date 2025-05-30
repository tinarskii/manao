import { validateEnv } from "./config/constants";
import { setupAuthProvider } from "./services/auth";
import { initializeChatClient } from "./services/chat";
import { initializeEventSub } from "./services/eventsub";
import { logger } from "./helpers/logger";

/**
 * Main application entry point
 */
export async function main() {
  try {
    // Validate environment variables
    validateEnv();

    // Setup authentication provider
    const authProvider = setupAuthProvider();

    // Initialize chat client
    const { chatClient, apiClient } = await initializeChatClient(authProvider);

    // Setup EventSub listener
    await initializeEventSub(chatClient, apiClient);

    logger.info("[Manao] Bot successfully initialized");
  } catch (error) {
    throw error;
  }
}
