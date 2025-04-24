import { RefreshingAuthProvider } from "@twurple/auth";
import { logger } from "../helpers/logger";
import { SCOPES } from "../config/constants";
import * as process from "process";

/**
 * Sets up and configures the Twitch authentication provider
 */
export function setupAuthProvider(): RefreshingAuthProvider {
  const authProvider = new RefreshingAuthProvider({
    clientId: process.env.CLIENT_ID!,
    clientSecret: process.env.CLIENT_SECRET!,
  });

  // Handle token refresh events
  authProvider.onRefresh(async (userID, newTokenData) => {
    if (userID === process.env.TW_ID) {
      process.env.REFRESH_TOKEN = newTokenData.refreshToken!;
      process.env.USER_ACCESS_TOKEN = newTokenData.accessToken!;
      process.env.EXPIRES_IN = String(newTokenData.expiresIn || 0);
      process.env.OBTAINMENT_TIMESTAMP = String(
        newTokenData.obtainmentTimestamp,
      );
      logger.info(`[Auth] Refreshed bot user token`);
    } else if (userID === process.env.BROADCASTER_ID) {
      process.env.BROADCASTER_REFRESH_TOKEN = newTokenData.refreshToken!;
      process.env.BROADCASTER_USER_ACCESS_TOKEN = newTokenData.accessToken!;
      process.env.EXPIRES_IN = String(newTokenData.expiresIn || 0);
      process.env.OBTAINMENT_TIMESTAMP = String(
        newTokenData.obtainmentTimestamp,
      );
      logger.info(`[Auth] Refreshed broadcaster token`);
    }
  });

  // Add bot user to auth provider
  authProvider.addUser(
    process.env.TW_ID!,
    {
      accessToken: process.env.USER_ACCESS_TOKEN!,
      refreshToken: process.env.REFRESH_TOKEN!,
      scope: SCOPES,
      expiresIn: Number(process.env.EXPIRES_IN || 0),
      obtainmentTimestamp: Number(process.env.OBTAINMENT_TIMESTAMP || 0),
    },
    ["chat"],
  );

  // Add broadcaster to auth provider
  if (
    process.env.BROADCASTER_USER_ACCESS_TOKEN &&
    process.env.BROADCASTER_REFRESH_TOKEN
  ) {
    authProvider.addUser(process.env.BROADCASTER_ID!, {
      accessToken: process.env.BROADCASTER_USER_ACCESS_TOKEN!,
      refreshToken: process.env.BROADCASTER_REFRESH_TOKEN!,
      scope: SCOPES,
      expiresIn: Number(process.env.EXPIRES_IN || 0),
      obtainmentTimestamp: Number(process.env.OBTAINMENT_TIMESTAMP || 0),
    });
  }

  logger.info("[Auth] Authentication provider configured");
  return authProvider;
}
