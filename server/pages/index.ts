import { Elysia } from "elysia";
import { registerSecuredPageRoutes } from "./secured-pages";
import { APP_DIR } from "../config";
import { renderPage } from "../index";

export function registerPageRoutes(app: Elysia) {
  // Register secured pages
  registerSecuredPageRoutes(app);

  // Public routes
  app.get("/", ({ set }) => {
    set.headers["Content-Type"] = "text/html";
    return renderPage({
      path: `${APP_DIR}/index.html`,
      pageName: "Homepage - Manaobot Web",
      script: "/js/index.js",
    });
  });
  app.get("/soundplayer", ({ set }) => {
    set.headers["Content-Type"] = "text/html";
    return renderPage({
      path: `${APP_DIR}/soundplayer.html`,
      pageName: "Sound Player - Manaobot Web",
      script: "/js/soundplayer.js",
    });
  });
  app.get("/queue", ({ set }) => {
    set.headers["Content-Type"] = "text/html";
    return renderPage({
      path: `${APP_DIR}/queue.html`,
      pageName: "Music Queue - Manaobot Web",
      script: "/js/queue.js",
    });
  });

  return app;
}
