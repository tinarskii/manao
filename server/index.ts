import { Elysia } from "elysia";
import { logger } from "../helpers/logger";
import { setupSocketIO } from "./services/socket";
import { registerApiRoutes } from "./api";
import { registerPageRoutes } from "./pages";
import { APP_DIR, PORT, PUBLIC_DIR, tlsOptions } from "./config";
import { staticPlugin } from "@elysiajs/static";
import { registerValidateTokenRoutes } from "./api/validateToken";
import { validateEnv } from "../config/constants";

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
registerValidateTokenRoutes(app);

// External libraries route
app.get("/js/socket.io/socket.io.js", () => {
  return Bun.file("./node_modules/socket.io/client-dist/socket.io.js");
});

// Setup Socket.IO with Express - this now starts its own server
const io = setupSocketIO(app);
export const CURRENT_SOCKET_IO_PORT = io.httpServer.address()?.port;

// renderPage function
export async function renderPage(opt: {
  path: string;
  pageName: string;
  stylesheet?: string;
  script?: string;
  excludeTailwind?: boolean;
  excludeTemplate?: boolean;
  replace?: Record<string, string>;
}) {
  const navbar = await Bun.file(`${APP_DIR}/partials/navbar.html`).text();
  const footer = await Bun.file(`${APP_DIR}/partials/footer.html`).text();
  const content = await Bun.file(opt.path).text();

  let pageContent = `
    <!doctype html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
      ${opt.stylesheet ? `<link rel="stylesheet" href="${opt.stylesheet}" />` : ""}
      <title>${opt.pageName}</title>
      ${opt.excludeTailwind ? "" : '<link rel="stylesheet" href="/css/dist/tailwind.css" />'}
      <script src="/js/socket.io/socket.io.js"></script>
      <script src="/js/common.js"></script>
    </head>
    <body>
      ${opt.excludeTemplate ? "" : navbar}
      ${content}
      ${opt.excludeTemplate ? "" : footer}
      ${opt.script ? `<script src="${opt.script}"></script>` : ""}
      ${opt.excludeTemplate ? "" : '<script src="/js/background.js"></script>'}
    </body>
    </html>
`;

  // Replace placeholders in the content
  if (opt.replace) {
    for (const [key, value] of Object.entries(opt.replace)) {
      pageContent = pageContent.replace(new RegExp(key, "g"), value);
    }
  }

  return pageContent;
}

function startApp() {
  // Start Elysia server
  app.listen(
    {
      port: PORT,
      tls: tlsOptions,
    },
    ({ hostname, port }) => {
      logger.info(`[Elysia] Running on http://${hostname}:${port}`);
    },
  );
}

export { app, io, startApp };
