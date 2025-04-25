import { createServer } from "node:https";
import { Server, Socket } from "socket.io";
import { Express } from "express";
import { songQueue } from "../../client/services/chat";
import { logger } from "../../client/helpers/logger";
import { tlsOptions } from "../config";

export function setupSocketIO(expressApp: Express) {
  // Create HTTPS server with Express
  const server = createServer(tlsOptions, expressApp);

  // Initialize Socket.IO
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    // Add these options to help with connection issues
    transports: ['websocket', 'polling'],
    pingTimeout: 30000,
    pingInterval: 25000,
  });

  // Register event handlers
  io.on("connection", handleSocketConnection);

  // Start listening on the server
  server.listen(3001, () => {
    logger.info("[Socket.IO] Running on http://localhost:3001");
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

  socket.on('play-sound', (data) => {
    logger.info(`[Socket.IO] ${socket.id} playing`);
    socket.broadcast.emit('play-sound', data);
  });
}