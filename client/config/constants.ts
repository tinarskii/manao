import * as process from "process";
import { logger } from "../helpers/logger";

// Application constants
export const PREFIX = "!";

// Required environment variables
export const REQUIRED_ENV_VARS = [
  "REFRESH_TOKEN",
  "CLIENT_ID",
  "CLIENT_SECRET",
  "USER_ACCESS_TOKEN",
  "TW_ID",
  "BROADCASTER_ID",
  "TW_CHANNEL",
];

// Twitch API scopes
export const SCOPES = [
  "user:edit",
  "user:read:email",
  "chat:read",
  "chat:edit",
  "channel:moderate",
  "moderation:read",
  "moderator:manage:shoutouts",
  "moderator:manage:announcements",
  "channel:manage:moderators",
  "channel:manage:broadcast",
  "channel:read:vips",
  "channel:read:subscriptions",
  "channel:manage:vips",
  "channel:read:redemptions",
  "channel:manage:redemptions",
  "moderator:read:followers",
  "bits:read",
];

// Channel point reward IDs
export const REWARDS = {
  KEEB_600: "89e83854-07cc-432b-94ce-438d446b5a6b",
  KEEB_2200: "b02c1598-3ae2-4b2d-a0ab-493155baec58",
  KEEB_5625: "51d28b56-e011-4d80-916b-f98ac4f98a3b",
  KEEB_11500: "7a39f8e0-411c-4b67-939f-4ac8f8cfb192",
};

// Reward amounts
export const REWARD_AMOUNTS = {
  [REWARDS.KEEB_600]: 600,
  [REWARDS.KEEB_2200]: 2200,
  [REWARDS.KEEB_5625]: 5625,
  [REWARDS.KEEB_11500]: 11500,
};

// Sub reward amount
export const SUB_REWARD_AMOUNT = 6900;

/**
 * Validates required environment variables
 */
export function validateEnv() {
  const missingVars = REQUIRED_ENV_VARS.filter(
    (varName) => !process.env[varName],
  );

  if (missingVars.length > 0) {
    throw new Error(`Missing environment variables: ${missingVars.join(", ")}`);
  }

  // Set defaults for expiration values if not present
  process.env.EXPIRES_IN = process.env.EXPIRES_IN || "0";
  process.env.OBTAINMENT_TIMESTAMP = process.env.OBTAINMENT_TIMESTAMP || "0";

  logger.info("[Config] Environment variables validated");
}
