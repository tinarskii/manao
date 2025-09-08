import { join } from "node:path";
import { logger } from "../helpers/logger";

// Environment
export const isProduction = Bun.env.NODE_ENV === "production";

// Ports
export const PORT = Bun.env.PORT ? parseInt(Bun.env.PORT) : 3000;
export const SOCKET_PORT = 0;

// Security
export const generateRandomToken = () => {
  return Math.random().toString(36).substring(2, 15);
};
export const token = Bun.env.OVERLAY_TOKEN || generateRandomToken();

// Paths
export const ROOT_DIR = isProduction ? "." : join(import.meta.dir, "..");
export const PUBLIC_DIR = isProduction ? "server/public" : join(ROOT_DIR, "server/public");
export const APP_DIR = isProduction ? "server/app" : join(ROOT_DIR, "server/app");

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
