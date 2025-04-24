import { Elysia } from "elysia";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { db } from "../helpers/database";
import { commands, logger, songQueue } from "../client/client";
import { createServer } from "node:https";
import { Server } from "socket.io";
import express from "express";
import cors from "cors";
import * as process from "process";
const expressApp = express();
expressApp.use(cors());
const isProduction = process.env.NODE_ENV === "production";
const server = createServer({
    cert: isProduction ? Bun.file("./server/server.crt") : "",
    key: isProduction ? Bun.file("./server/server.key") : "",
}, expressApp);
const randomToken = () => {
    return Math.random().toString(36).substring(2, 15);
};
let token = process.env.OVERLAY_TOKEN || randomToken();
logger.info(`[Elysia] Token: ${token}`);
export const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});
server.listen(3001, () => {
    logger.info("[Socket.IO] Running on http://localhost:3001");
});
io.on("connection", (socket) => {
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
});
const __dirname = dirname(fileURLToPath(import.meta.url));
export const app = new Elysia();
app.get("/", () => {
    return new Response("Hello World!");
});
app.get("/api/nickname", ({ query }) => {
    let userID = query.id;
    let stmt = db.prepare("SELECT nickname FROM users WHERE user = ?");
    return stmt.get(userID) || { nickname: null };
});
app.get("/api/nickname/all", () => {
    let stmt = db.prepare("SELECT user, nickname FROM users");
    return stmt.all();
});
app.get("/api/commands", () => {
    let commandList = [];
    for (let command of commands.values()) {
        commandList.push({
            name: command.name,
            description: command.description,
            alias: command.alias,
            args: command.args,
        });
    }
    return commandList;
});
app.get("/api/queue", () => {
    return songQueue;
});
app.get(`/feed-${token}`, () => {
    return Bun.file(__dirname + "/app/feed.html");
});
app.get(`/chat-${token}`, () => {
    return Bun.file(__dirname + "/app/chat.html");
});
app.get(`/music-${token}`, () => {
    return Bun.file(__dirname + "/app/music.html");
});
app.get("/queue", () => {
    return Bun.file(__dirname + "/app/queue.html");
});
app.get("/socket.io/socket.io.js", () => {
    return Bun.file("./node_modules/socket.io/client-dist/socket.io.js");
});
app.listen({
    port: process.env.PORT ?? 3000,
    tls: {
        cert: isProduction ? Bun.file("./server/server.crt") : "",
        key: isProduction ? Bun.file("./server/server.key") : "",
    },
}, ({ hostname, port }) => {
    logger.info(`[Elysia] Running on https://${hostname}:${port}`);
});
