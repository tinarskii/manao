import { Elysia } from "elysia";
import { songQueue } from "../../client/services/chat";
import { logger } from "../../client/helpers/logger";
import { db } from "../../client/helpers/database";

export function registerMusicRoutes(app: Elysia) {
  // Current queue
  app.get("/api/queue", () => songQueue);

  return app;
}
