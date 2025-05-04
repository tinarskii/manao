import { Elysia } from "elysia";
import { commands } from "../../client/services/chat";
import { Command } from "../../client/types";

export function registerCommandRoutes(app: Elysia) {
  app.get("/api/commands", () => {
    const commandList = [];
    for (const command of commands.values()) {
      commandList.push({
        name: command.name,
        description: command.description,
        alias: command.alias,
        args: command.args,
        disabled: command.disabled ?? false,
      });
    }
    return commandList;
  });

  app.get("/api/commands/:commandName", ({ params: { commandName } }) => {
    // @ts-ignore
    const command = commands.get(commandName);
    if (!command) {
      return { error: "Command not found" };
    }
    return {
      name: command.name,
      description: command.description,
      alias: command.alias,
      args: command.args,
      disabled: command.disabled ?? false,
      modsOnly: command.modsOnly ?? false,
      broadcasterOnly: command.broadcasterOnly ?? false,
      execute: command.execute.toString(),
    }
  });

  app.put("/api/commands/:commandName", ({ params: { commandName }, body }) => {
    // @ts-ignore
    const command = commands.get(commandName);
    if (!command) {
      return { error: "Command not found" };
    }

    let newCmd = body as Command;
    command.disabled = newCmd.disabled;
    command.description = newCmd.description;
    command.alias = newCmd.alias;
    command.args = newCmd.args;
    command.modsOnly = newCmd.modsOnly;
    command.broadcasterOnly = newCmd.broadcasterOnly;
    return { success: true, command };
  });

  app.delete("/api/commands/:commandName", ({ params: { commandName } }) => {
    // @ts-ignore
    const command = commands.get(commandName);
    if (!command) {
      return { error: "Command not found" };
    }

    commands.delete(commandName);
    return { success: true, command };
  });

  app.post("/api/commands/:commandName/toggle", ({ params: { commandName } }) => {
    // @ts-ignore
    const command = commands.get(commandName);
    if (!command) {
      return { error: "Command not found" };
    }
    command.disabled = !command.disabled;
    if (command.disabled) {
      command.originalExecute = command.execute;
      command.execute = () => undefined;
    } else {
      command.execute = command.originalExecute;
      delete command.originalExecute;
    }
    return { success: true, enabled: command.disabled };
  });
  return app;
}
