import { Elysia } from "elysia";
import { registerNicknameRoutes } from "./nicknames";
import { registerCommandRoutes } from "./commands";
import { registerMusicRoutes } from "./music";

export function registerApiRoutes(app: Elysia) {
  // Base route
  app.get("/", () => new Response("Hello World!"));

  // Register API route groups
  registerNicknameRoutes(app);
  registerCommandRoutes(app);
  registerMusicRoutes(app);

  return app;
}