import { Elysia } from "elysia";
import { APP_DIR, token } from "../config";
import { renderPage } from "../index";

export function registerSecuredPageRoutes(app: Elysia) {
  const securedPages = ["feed", "chat", "music", "soundboard"];
  const securedPageNames = [
    "Feed - Manaobot Web",
    "Chat - Manaobot Web",
    "Music - Manaobot Web",
    "Soundboard - Manaobot Web",
  ];

  const securedHandler =
    (page: string) =>
    ({ query, set }: { query: any, set: any }) => {
      if (query.token !== token) {
        return new Response("Unauthorized", { status: 401 });
      }
      set.headers["Content-Type"] = "text/html";
      return renderPage({
        path: `${APP_DIR}/${page}.html`,
        pageName: securedPageNames[securedPages.indexOf(page)],
        stylesheet: `/css/${page}.css`,
        script: `/js/${page}.js`,
      });
    };

  for (const page of securedPages) {
    app.get(`/${page}`, securedHandler(page));
  }

  return app;
}
