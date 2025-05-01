import { Elysia } from "elysia";
import { commands } from "../../client/services/chat";

export function registerCommandRoutes(app: Elysia) {
  app.get("/api/commands", () => {
    const commandList = [];
    for (const command of commands.values()) {
      commandList.push({
        name: command.name,
        description: command.description,
        alias: command.alias,
        args: command.args,
      });
    }
    return commandList;
  });

  return app;
}
