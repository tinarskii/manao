import { Elysia } from "elysia";
import { customCommands } from "../../client/services/chat";
import { Command } from "../../types";
import { addCommand, deleteCommand } from "../../helpers/database";
import { findCommand } from "../../helpers/command";

export function registerCustomCommandRoutes(app: Elysia) {
  app.get("/api/custom-commands", () => {
    const commandList = [];
    for (const command of customCommands.values()) {
      commandList.push({
        name: command.name,
        description: command.description,
        aliases: command.aliases,
        args: [],
        disabled: command.disabled ?? false,
        execute: command.execute,
      });
    }
    return commandList;
  });

  app.post("/api/custom-commands", ({ body }: { body: string }) => {
    const newCommand = JSON.parse(body) as Command;

    // Check if command already exists
    if (findCommand(customCommands, newCommand.name.en)) {
      return { error: "Command already exists" };
    }

    try {
      addCommand(newCommand);
      customCommands.set(newCommand.name.en, newCommand);
    } catch (error) {
      console.error("Error adding command:", error);
      return { error: "Failed to add command" };
    }

    return {
      success: true,
    };
  });

  app.put(
    "/api/custom-commands/:commandName",
    ({
      params: { commandName },
      body,
    }: {
      params: { commandName: string };
      body: string;
    }) => {
      const command = findCommand(customCommands, commandName);
      if (!command) {
        return { error: "Command not found" };
      }

      const updatedCommand = JSON.parse(body) as Command;

      // Update the command properties
      command.name = updatedCommand.name;
      command.description = updatedCommand.description;
      command.aliases = updatedCommand.aliases;
      command.args = updatedCommand.args;
      command.modsOnly = updatedCommand.modsOnly;
      command.broadcasterOnly = updatedCommand.broadcasterOnly;
      command.execute = updatedCommand.execute;

      // Save the updated command to the database
      addCommand(command);
      customCommands.set(command.name.en, command);

      return { success: true, command };
    },
  );

  app.delete(
    "/api/custom-commands/:commandName",
    ({ params: { commandName } }) => {
      const command = findCommand(customCommands, commandName);
      if (!command) {
        return { error: "Command not found" };
      }

      customCommands.delete(command.name.en);
      deleteCommand(JSON.stringify(command.name));
      return { success: true };
    },
  );
}
