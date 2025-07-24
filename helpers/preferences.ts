import { db } from "./database";
import { CommandArg, LocalizedCommandArg, PreferencesData } from "../types";

/**
 * Get user preferred language from the database.
 * @returns {"en" | "th"} The language code.
 */
export function getLang(): "en" | "th" {
  let stmt = db.prepare("SELECT lang FROM preferences WHERE userID = ?");
  const lang = stmt.get(Bun.env.BROADCASTER_ID!) as Pick<
    PreferencesData,
    "lang"
  >;

  if (!lang) {
    stmt = db.prepare("INSERT INTO preferences (userID, lang) VALUES (?, ?)");
    stmt.run(Bun.env.BROADCASTER_ID!, "en");
    return "en";
  }

  return lang.lang;
}

/**
 * Update user preferred language in the database.
 * @param {string} newLang The new language code to set.
 * @returns {void}
 */
export function updateLang(newLang: string): void {
  const stmt = db.prepare("UPDATE preferences SET lang = ? WHERE userID = ?");
  stmt.run(newLang, Bun.env.BROADCASTER_ID!);
}

/**
 * Get user preferred currency from the database.
 * @returns {string} User currency
 */
export function getCurrency(): string {
  let stmt = db.prepare("SELECT currency FROM preferences WHERE userID = ?");
  const currency = stmt.get(Bun.env.BROADCASTER_ID!) as Pick<
    PreferencesData,
    "currency"
  >;

  if (!currency) {
    stmt = db.prepare(
      "INSERT INTO preferences (userID, currency) VALUES (?, ?)",
    );
    stmt.run(Bun.env.BROADCASTER_ID!, "KEEB");
    return "KEEB";
  }

  return currency.currency;
}

/**
 * Update user preferred currency in the database.
 * @param {string} newCurrency The new currency to set.
 * @returns {void}
 */
export function updateCurrency(newCurrency: string): void {
  const stmt = db.prepare(
    "UPDATE preferences SET currency = ? WHERE userID = ?",
  );
  stmt.run(newCurrency, Bun.env.BROADCASTER_ID!);
}

/**
 * Localizes command arguments based on the provided language.
 * @param {Array<LocalizedCommandArg>} arg The command arguments to localize.
 * @param {"en" | "th"} lang The language code to use for localization.
 * @return {Array<CommandArg>} The localized command arguments.
 */
export function localizeCommandArgs(
  arg: Array<LocalizedCommandArg>,
  lang: "en" | "th",
): Array<CommandArg> {
  return arg?.map((a) => {
    return {
      ...a,
      name: a.name[lang],
      description: a.description[lang],
    };
  });
}

/**
 * Get list of disabled commands.
 * @return {Array<string>} List of disabled command names.
 */
export function getDisabledCommands(): Array<string> {
  const stmt = db.prepare(
    "SELECT disabledCommands FROM preferences WHERE userID = ?",
  );
  const result = stmt.get(Bun.env.BROADCASTER_ID!) as Pick<
    PreferencesData,
    "disabledCommands"
  >;

  if (!result || !result.disabledCommands) {
    return [];
  }

  return JSON.parse(result.disabledCommands) as Array<string>;
}

/**
 * Toggle a command's disabled state.
 * @param {string} commandName The name of the command to toggle.
 * @returns {boolean} True if the command was successfully toggled, false otherwise.
 */
export function toggleCommand(commandName: string): boolean {
  const disabledCommands = getDisabledCommands();
  const commandIndex = disabledCommands.indexOf(commandName);

  if (commandIndex > -1) {
    // Command is currently disabled, enable it
    disabledCommands.splice(commandIndex, 1);
  } else {
    // Command is currently enabled, disable it
    disabledCommands.push(commandName);
  }

  const stmt = db.prepare(
    "UPDATE preferences SET disabledCommands = ? WHERE userID = ?",
  );
  stmt.run(JSON.stringify(disabledCommands), Bun.env.BROADCASTER_ID!);

  return commandIndex === -1; // Return true if command was enabled, false if it was disabled
}
