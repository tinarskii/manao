import { Command, CommandList } from "../types";

/**
 * Finds a command by checking name and aliases in both languages
 * @param {CommandList} commandMap The command collection to search
 * @param {string} searchTerm The command name/alias to find
 * @returns {Command|null} Found command object or null
 */
export function findCommand(
  commandMap: CommandList,
  searchTerm: string,
): Command | null {
  for (const command of commandMap.values()) {
    // Check exact name matches first (most common case)
    if (command.name.en === searchTerm || command.name.th === searchTerm) {
      return command;
    }

    // Check aliases if they exist
    const enAliases = command.aliases?.en || [];
    const thAliases = command.aliases?.th || [];

    if (enAliases.includes(searchTerm) || thAliases.includes(searchTerm)) {
      return command;
    }
  }
  return null;
}
