import { Elysia } from "elysia";
import { token } from "../config";

export function registerValidateTokenRoutes(app: Elysia) {
  // Validate token
  app.get("/api/validate-token", ({ query }) => {
    const { token: givenToken } = query;
    if (!givenToken) return { valid: false };

    return { valid: givenToken === token };
  });

  return app;
}
