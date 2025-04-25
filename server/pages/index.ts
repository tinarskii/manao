import { Elysia } from "elysia";
import { registerSecuredPageRoutes } from "./secured-pages";
import { APP_DIR } from "../config";

export function registerPageRoutes(app: Elysia) {
  // Register secured pages
  registerSecuredPageRoutes(app);

  // Public routes
  app.get("/soundplayer", () => Bun.file(`${APP_DIR}/soundplayer.html`));
  app.get("/queue", () => Bun.file(`${APP_DIR}/queue.html`));

  return app;
}