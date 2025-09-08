import { Elysia } from "elysia";
import { registerNicknameRoutes } from "./nicknames";
import { registerCommandRoutes } from "./commands";
import { registerMusicRoutes } from "./music";
import { registerCustomCommandRoutes } from "./custom-commands";
import { getLang } from "../../helpers/preferences";
import { CURRENT_SOCKET_IO_PORT } from "../index";

export function registerApiRoutes(app: Elysia) {
  // Base route
  app.get("/route", () => {
    // Show available routes as Text
    const routes = app.routes
      .map((route) => `${route.method} ${route.path}`)
      .join("\n");
    return `Available routes:\n${routes}`;
  });

  // Get current language
  app.get("/api/lang", () => {
    return { lang: getLang() };
  });

  // Get current socket.io port
  app.get("/socket.io-port", () => {
    return CURRENT_SOCKET_IO_PORT;
  })

  // Register API route groups
  registerNicknameRoutes(app);
  registerCommandRoutes(app);
  registerMusicRoutes(app);
  registerCommandRoutes(app);
  registerCustomCommandRoutes(app);

  return app;
}
