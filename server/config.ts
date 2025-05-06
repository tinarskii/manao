import { join } from "node:path";
import { logger } from "../client/helpers/logger";

// Environment
export const isProduction = process.env.NODE_ENV === "production";

// Ports
export const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
export const SOCKET_PORT = 3001;

// Security
export const generateRandomToken = () => {
  return Math.random().toString(36).substring(2, 15);
};
export const token = Bun.env.OVERLAY_TOKEN || generateRandomToken();

// Paths
export const ROOT_DIR = join(import.meta.dir, "..");
export const PUBLIC_DIR = join(ROOT_DIR, "server/public");
export const APP_DIR = join(ROOT_DIR, "server/app");

// TLS options
export const tlsOptions = {
  cert: "" /* isProduction ? Bun.file(join(ROOT_DIR, "server/server.crt")) : "" */,
  key: "" /* isProduction ? Bun.file(join(ROOT_DIR, "server/server.key")) : "" */,
};

// Log configuration at startup
logger.info(
  `[Config] Environment: ${isProduction ? "Production" : "Development"}`,
);
logger.info(`[Config] ============> Overlay Token: ${token} <============`);
