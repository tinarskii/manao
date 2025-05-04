import { Elysia } from "elysia";
import { APP_DIR, token } from "../config";
import { renderPage } from "../index";

export function registerSecuredPageRoutes(app: Elysia) {
  const securedPages = ["feed", "chat", "music", "soundboard", "commands", "command-edit"];
  const securedPageNames = [
    "Feed - Manaobot Web",
    "Chat - Manaobot Web",
    "Music - Manaobot Web",
    "Soundboard - Manaobot Web",
    "Commands - Manaobot Web",
    "Edit Command - Manaobot Web",
  ];

  const securedHandler =
    (page: string) =>
    ({ query, set }: { query: any, set: any }) => {
      if (!query.token) {
        set.headers["Content-Type"] = "text/html";
        return `
        <!doctype html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Token Required | Manaobot Web</title>
        </head>
        <script>
        let token = prompt("Please enter the token to access this page:");
        if (token) {
          window.open("/${page}?token=" + token, "_self");
        } else {
          alert("Token is required to access this page.");
          window.location.href = "/";
        }
        </script>
        `
      } else if (query.token !== token) {
        return new Response("Unauthorized", { status: 401 });
      }
      set.headers["Content-Type"] = "text/html";
      let excludeTailwind = page !== "music" && !page.startsWith("command");
      let excludeTemplate = !page.startsWith("command")
      return renderPage({
        path: `${APP_DIR}/${page}.html`,
        pageName: securedPageNames[securedPages.indexOf(page)],
        stylesheet: `/css/${page}.css`,
        script: `/js/${page}.js`,
        excludeTailwind,
        excludeTemplate
      });
    };

  for (const page of securedPages) {
    app.get(`/${page}`, securedHandler(page));
  }

  return app;
}
