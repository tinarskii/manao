import { Server, Socket } from "socket.io";
import { songQueue } from "../../client/services/chat";
import { logger } from "../../client/helpers/logger";
import { SOCKET_PORT } from "../config";
import { Elysia } from "elysia";

export function setupSocketIO(app: Elysia) {
  const io = new Server({
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type"],
      credentials: true,
    },
  }).listen(SOCKET_PORT);

  // Register event handlers
  io.on("connection", handleSocketConnection);

  app.all("/socket.io*", async ({ request }) => {
    const url = new URL(request.url);

    return fetch(
      url.toString().replace(url.origin, `http://localhost:${SOCKET_PORT}`),
      {
        method: request.method,
        headers: request.headers,
        body: new Uint8Array(await request.arrayBuffer()),
      },
    );
  });

  return io;
}

function handleSocketConnection(socket: Socket) {
  logger.info(`[Socket] ${socket.id} connected`);

  socket.on("disconnect", () => {
    logger.info(`[Socket] ${socket.id} disconnected`);
  });

  socket.on("songEnded", () => {
    songQueue.shift();
    socket.emit("songQueue", songQueue);
  });

  socket.on("getQueue", () => {
    socket.emit("songQueue", songQueue);
  });

  socket.on("play-sound", (data) => {
    logger.info(`[Socket.IO] ${socket.id} playing`);
    socket.broadcast.emit("play-sound", data);
  });

  socket.on("currentSongProgress", (data) => {
    socket.broadcast.emit("currentSongProgress", data);
  })
}
