import { Elysia } from "elysia";
import { APP_DIR, token } from "../config";

export function registerSecuredPageRoutes(app: Elysia) {
  // Token-secured routes
  app.get(`/feed-${token}`, () => Bun.file(`${APP_DIR}/feed.html`));
  app.get(`/chat-${token}`, () => Bun.file(`${APP_DIR}/chat.html`));
  app.get(`/music-${token}`, () => Bun.file(`${APP_DIR}/music.html`));
  app.get(`/soundboard-${token}`, () => Bun.file(`${APP_DIR}/soundboard.html`));

  return app;
}