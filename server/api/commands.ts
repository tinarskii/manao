import { Elysia } from "elysia";
import { commands } from "../../client/services/chat";
import { getLang, localizeCommandArgs, toggleCommand } from "../../helpers/preferences";

export function registerCommandRoutes(app: Elysia) {
  app.get("/api/commands", () => {
    const commandList = [];
    const lang = getLang();
    for (const command of commands.values()) {
      commandList.push({
        name: command.name[lang],
        description: command.description[lang],
        alias: command.aliases?.[lang],
        args: localizeCommandArgs(command.args ?? [], lang),
        disabled: command.disabled ?? false,
      });
    }
    return commandList;
  });

  app.get("/api/commands/:commandName", ({ params: { commandName } }) => {
    let cmdName = decodeURIComponent(commandName);

    // Check if thai command name, if so, get the english name
    for (const command of commands.values()) {
      if (
        command.name.th === cmdName ||
        (command.aliases?.th || []).includes(cmdName) ||
        (command.aliases?.en || []).includes(cmdName)
      ) {
        // @ts-ignore
        cmdName = command.name.en;
        break;
      }
    }

    // @ts-ignore
    const command = commands.get(cmdName);
    if (!command) {
      return { error: "Command not found" };
    }
    const lang = getLang();
    return {
      name: command.name[lang],
      description: command.description[lang],
      alias: command.aliases?.[lang],
      args: localizeCommandArgs(command.args ?? [], lang),
      disabled: command.disabled ?? false,
      modsOnly: command.modsOnly ?? false,
      broadcasterOnly: command.broadcasterOnly ?? false,
    };
  });

  app.post(
    "/api/commands/:commandName/toggle",
    ({ params: { commandName } }) => {
      const command = commands.get(commandName);
      if (!command) {
        return { error: "Command not found" };
      }
      command.disabled = !command.disabled;
      toggleCommand(command.name.en);
      return { success: true, enabled: command.disabled };
    },
  );

  return app;
}
