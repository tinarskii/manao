import { Database } from "bun:sqlite";

export const db = new Database("./bot-data.sqlite", { create: true });

export function initDatabase(): void {
  db.exec(`
CREATE TABLE IF NOT EXISTS users (
    user       varchar,
    money      integer DEFAULT 0,
    nickname   varchar(64),
    lastDaily  integer,
    lastWeekly integer
);

CREATE TABLE IF NOT EXISTS preferences (
    defaultSong      TEXT,
    disabledCommands text,
    userID           integer PRIMARY KEY,
    lang             text NOT NULL DEFAULT 'en',
    currency         text NOT NULL DEFAULT 'COIN'
);
`);
}
