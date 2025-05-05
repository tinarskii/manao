import { db } from "./database";

export function initAccount(userID: string | number) {
  let stmt = db.prepare("SELECT money FROM users WHERE user = ?");
  if (!stmt.get(userID)) {
    stmt = db.prepare("INSERT INTO users (user, money) VALUES (?, ?)");
    stmt.run(userID, 0);
  }
}

export function checkNickname(userID: string | number) {
  const stmt = db.prepare("SELECT nickname FROM users WHERE user = ?");
  return stmt.get(userID)?.nickname || null;
}
