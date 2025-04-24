import { Database } from "bun:sqlite";
export const db = new Database("./bot-data.sqlite", { create: true });
