import { Elysia } from "elysia";
import { songQueue } from "../../client/services/chat";
import { logger } from "../../client/helpers/logger";

export function registerMusicRoutes(app: Elysia) {
  // Current queue
  app.get("/api/queue", () => songQueue);

  // Default songs
  app.get("/api/default-songs", async () => {
    try {
      // @ts-ignore
      const module = await import("../public/js/defaultSongs.js");
      return module.defaultSongs;
    } catch (error) {
      logger.error(`Error loading default songs: ${error}`);
      return [];
    }
  });

  return app;
}