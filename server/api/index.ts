import { Elysia } from "elysia";
import { registerNicknameRoutes } from "./nicknames";
import { registerCommandRoutes } from "./commands";
import { registerMusicRoutes } from "./music";

export function registerApiRoutes(app: Elysia) {
  // Base route
  app.get("/", () => {
    // Show available routes as Text
    const routes = app.routes.map((route) => `${route.method} ${route.path}`).join("\n");
    return `Available routes:\n${routes}`;
  })

  // Register API route groups
  registerNicknameRoutes(app);
  registerCommandRoutes(app);
  registerMusicRoutes(app);

  return app;
}