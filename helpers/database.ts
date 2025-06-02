import { Database } from "bun:sqlite";
import { UserData } from "../client/types";

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

export function initAccount(userID: string | number) {
  let stmt = db.prepare("SELECT money FROM users WHERE user = ?");
  if (!stmt.get(userID)) {
    stmt = db.prepare("INSERT INTO users (user, money) VALUES (?, ?)");
    stmt.run(userID, 0);
  }
}

export function checkNickname(userID: string | number) {
  const stmt = db.prepare("SELECT nickname FROM users WHERE user = ?");
  return (stmt.get(userID) as UserData)?.nickname || null;
}
