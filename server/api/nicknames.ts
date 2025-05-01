import { Elysia } from "elysia";
import { db } from "../../client/helpers/database";

export function registerNicknameRoutes(app: Elysia) {
  // Get single nickname
  app.get("/api/nickname", ({ query }) => {
    const userID = query.id;
    const stmt = db.prepare("SELECT nickname FROM users WHERE user = ?");
    return stmt.get(userID) || { nickname: null };
  });

  // Get all nicknames
  app.get("/api/nickname/all", () => {
    const stmt = db.prepare("SELECT user, nickname FROM users");
    return stmt.all();
  });

  return app;
}
