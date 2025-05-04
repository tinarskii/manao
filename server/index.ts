import { Elysia } from "elysia";
import { logger } from "../client/helpers/logger";
import { setupSocketIO } from "./services/socket";
import { registerApiRoutes } from "./api";
import { registerPageRoutes } from "./pages";
import { APP_DIR, PORT, PUBLIC_DIR, tlsOptions } from "./config";
import staticPlugin from "@elysiajs/static";

// Initialize Elysia app
const app = new Elysia();

// Static file serving
app.use(
  staticPlugin({
    prefix: "/",
    assets: PUBLIC_DIR,
  }),
);

// Register routes
registerApiRoutes(app);
registerPageRoutes(app);

// External libraries route
app.get("/js/socket.io/socket.io.js", () => {
  return Bun.file("./node_modules/socket.io/client-dist/socket.io.js");
});

// Setup Socket.IO with Express - this now starts its own server
const io = setupSocketIO(app);

// renderPage function
export async function renderPage(opt: { path: string, pageName: string, stylesheet?: string, script?: string }) {
  const navbar = await Bun.file(`${APP_DIR}/partials/navbar.html`).text();
  const footer = await Bun.file(`${APP_DIR}/partials/footer.html`).text();
  const content = await Bun.file(opt.path).text();

  return `
    <!doctype html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      ${opt.stylesheet ? `<link rel="stylesheet" href="${opt.stylesheet}" />` : ""}
      <title>${opt.pageName}</title>
      <link rel="stylesheet" href="/css/dist/tailwind.css" />
      <script src="/js/socket.io/socket.io.js"></script>
      <script src="/js/common.js"></script>
    </head>
    <body>
      ${navbar}
      ${content}
      ${footer}
      <script src="/js/common.js"></script>
      ${opt.script ? `<script src="${opt.script}"></script>` : ""}
    </body>
    </html>
`
}

function startApp() {
  // Start Elysia server
  app.listen(
    {
      port: PORT,
      tls: tlsOptions,
    },
    ({ hostname, port }) => {
      logger.info(`[Elysia] Running on https://${hostname}:${port}`);
    },
  );
}

export { app, io, startApp };
