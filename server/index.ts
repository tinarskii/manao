import { Elysia } from "elysia";
import express from "express";
import cors from "cors";
import staticPlugin from "@elysiajs/static";
import { logger } from "../client/helpers/logger";
import { setupSocketIO } from "./services/socket";
import { registerApiRoutes } from "./api";
import { registerPageRoutes } from "./pages";
import { PORT, PUBLIC_DIR, tlsOptions } from "./config";

// Initialize Express app for Socket.IO
const expressApp = express();
expressApp.use(cors());

// Setup Socket.IO with Express - this now starts its own server
const io = setupSocketIO(expressApp);

// Initialize Elysia app
const app = new Elysia();

// Serve static files
app.use(
  staticPlugin({
    prefix: "/",
    assets: PUBLIC_DIR,
  })
);

// Register routes
registerApiRoutes(app);
registerPageRoutes(app);

// External libraries route
app.get("/socket.io/socket.io.js", () => {
  return Bun.file("./node_modules/socket.io/client-dist/socket.io.js");
});

function startApp() {
// Start Elysia server
  app.listen(
    {
      port: PORT,
      tls: tlsOptions,
    },
    ({ hostname, port }) => {
      logger.info(`[Elysia] Running on https://${hostname}:${port}`);
    }
  );
}

export { app, io, startApp };