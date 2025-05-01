import { Elysia } from "elysia";
import { APP_DIR, token } from "../config";

export function registerSecuredPageRoutes(app: Elysia) {
  const securedPages = ["feed", "chat", "music", "soundboard"];

  const securedHandler =
    (page: string) =>
    ({ query }: { query: any }) => {
      if (query.token !== token) {
        return new Response("Unauthorized", { status: 401 });
      }
      return Bun.file(`${APP_DIR}/${page}.html`);
    };

  for (const page of securedPages) {
    app.get(`/${page}`, securedHandler(page));
  }

  return app;
}
