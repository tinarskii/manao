import { RefreshingAuthProvider } from "@twurple/auth";
import { logger } from "../../helpers/logger";
import { SCOPES } from "../../config/constants";

/**
 * Sets up and configures the Twitch authentication provider
 */
export function setupAuthProvider(): RefreshingAuthProvider {
  const authProvider = new RefreshingAuthProvider({
    clientId: Bun.env.CLIENT_ID!,
    clientSecret: Bun.env.CLIENT_SECRET!,
  });

  // Handle token refresh events
  authProvider.onRefresh(async (userID, newTokenData) => {
    if (userID === Bun.env.TW_ID) {
      Bun.env.REFRESH_TOKEN = newTokenData.refreshToken!;
      Bun.env.USER_ACCESS_TOKEN = newTokenData.accessToken!;
      Bun.env.EXPIRES_IN = String(newTokenData.expiresIn || 0);
      Bun.env.OBTAINMENT_TIMESTAMP = String(newTokenData.obtainmentTimestamp);
      logger.info("[Auth] Refreshed bot user token");
    } else if (userID === Bun.env.BROADCASTER_ID) {
      Bun.env.BROADCASTER_REFRESH_TOKEN = newTokenData.refreshToken!;
      Bun.env.BROADCASTER_ACCESS_TOKEN = newTokenData.accessToken!;
      Bun.env.EXPIRES_IN = String(newTokenData.expiresIn || 0);
      Bun.env.OBTAINMENT_TIMESTAMP = String(newTokenData.obtainmentTimestamp);
      logger.info("[Auth] Refreshed broadcaster token");
    }
  });

  // Add bot user to auth provider
  authProvider.addUser(
    Bun.env.TW_ID!,
    {
      accessToken: Bun.env.USER_ACCESS_TOKEN!,
      refreshToken: Bun.env.REFRESH_TOKEN!,
      scope: SCOPES,
      expiresIn: Number(Bun.env.EXPIRES_IN || 0),
      obtainmentTimestamp: Number(Bun.env.OBTAINMENT_TIMESTAMP || 0),
    },
    ["chat"],
  );

  // Add broadcaster to auth provider
  if (Bun.env.BROADCASTER_ACCESS_TOKEN && Bun.env.BROADCASTER_REFRESH_TOKEN) {
    authProvider.addUser(Bun.env.BROADCASTER_ID!, {
      accessToken: Bun.env.BROADCASTER_ACCESS_TOKEN!,
      refreshToken: Bun.env.BROADCASTER_REFRESH_TOKEN!,
      scope: SCOPES,
      expiresIn: Number(Bun.env.EXPIRES_IN || 0),
      obtainmentTimestamp: Number(Bun.env.OBTAINMENT_TIMESTAMP || 0),
    });
  }

  logger.info("[Auth] Authentication provider configured");
  return authProvider;
}
