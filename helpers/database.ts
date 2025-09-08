import { Database } from "bun:sqlite";
import { Command, CommandList, UserData } from "../types";
import { logger } from "./logger";

export const db = new Database("./bot-data.sqlite", { create: true });

/**
 * Initializes the database with the required tables.
 * @returns {void}
 */
export function initDatabase(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users
    (
      user       varchar,
      money      integer DEFAULT 0,
      nickname   varchar(64),
      lastDaily  integer,
      lastWeekly integer
    );

    CREATE TABLE IF NOT EXISTS preferences
    (
      defaultSong      TEXT,
      disabledCommands text,
      userID           integer PRIMARY KEY,
      lang             text NOT NULL DEFAULT 'en',
      currency         text NOT NULL DEFAULT 'COIN'
    );

    CREATE TABLE IF NOT EXISTS commands
    (
      name            TEXT PRIMARY KEY,
      description     TEXT,
      aliases         TEXT    DEFAULT '[]',
      args            TEXT    DEFAULT '[]',
      modsOnly        BOOLEAN DEFAULT false,
      broadcasterOnly BOOLEAN DEFAULT false,
      disabled        BOOLEAN DEFAULT false,
      execute         TEXT
    )
  `);
}

/**
 * Initializes a user account in the database if it does not exist.
 * @param {string | number} userID The ID of the user to initialize.
 * @returns {void}
 */
export function initAccount(userID: string | number): void {
  let stmt = db.prepare("SELECT money FROM users WHERE user = ?");
  if (!stmt.get(userID)) {
    stmt = db.prepare("INSERT INTO users (user, money) VALUES (?, ?)");
    stmt.run(userID, 0);
  }
}

/**
 * Gets the nickname of a user from the database.
 * @param {string | number} userID The ID of the user.
 * @return {string | null} The nickname of the user, or null if not found.
 */
export function getNickname(userID: string | number): string | null {
  const stmt = db.prepare("SELECT nickname FROM users WHERE user = ?");
  return (stmt.get(userID) as UserData)?.nickname || null;
}

/**
 * Gets the balance of a user from the database.
 * @param {string | number} userID The ID of the user.
 * @return {number} An object containing the user's balance.
 */
export function getBalance(userID: string | number): number {
  return (
    (
      db.prepare("SELECT money FROM users WHERE user = ?").get(userID) as Pick<
        UserData,
        "money"
      >
    ).money || 0
  );
}

export function addBalance(userID: string | number, amount: number): number {
  const stmt = db.prepare("UPDATE users SET money = money + ? WHERE user = ?");
  stmt.run(amount, userID);
  return getBalance(userID);
}
export function subtractBalance(
  userID: string | number,
  amount: number,
): number {
  const stmt = db.prepare("UPDATE users SET money = money - ? WHERE user = ?");
  stmt.run(amount, userID);
  return getBalance(userID);
}
export function setBalance(userID: string | number, amount: number): number {
  const stmt = db.prepare("UPDATE users SET money = ? WHERE user = ?");
  stmt.run(amount, userID);
  return getBalance(userID);
}

/**
 * Add a custom command to the database.
 * @param {Command} command The command object to add.
 * @return {void}
 */
export function addCommand(command: Command): void {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO commands (name, description, aliases, args, modsOnly, broadcasterOnly, disabled, execute)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  try {
    stmt.run(
      JSON.stringify(command.name),
      JSON.stringify(command.description),
      JSON.stringify(command.aliases || []),
      JSON.stringify(command.args || []),
      command.modsOnly || false,
      command.broadcasterOnly || false,
      command.disabled || false,
      command.execute.toString(),
    );
    logger.info(`[Custom Command] Added command: ${command.name.en}`);
  } catch (error) {
    throw new Error(`Failed to add command: ${error}`);
  }
}

/**
 * Fetch all custom commands data from the database
 * @return {CommandList}
 */
export function fetchCommand(): CommandList {
  initDatabase();
  const stmt = db.prepare("SELECT * FROM commands");
  const commands = stmt.all() as Array<Command>;

  commands.forEach((c: Command) => {
    c.name = JSON.parse(String(c.name));
    c.description = JSON.parse(String(c.description));
    c.aliases = JSON.parse(String(c.aliases));
    c.args = JSON.parse(String(c.args));
  });

  const commandList: CommandList = new Map();
  commands.forEach((c: Command) => {
    commandList.set(c.name.en, c);
  });

  return commandList || new Map();
}

/**
 * Delete a command from the database.
 * @param {string} commandName The name of the command to delete.
 */
export function deleteCommand(commandName: string): void {
  const stmt = db.prepare("DELETE FROM commands WHERE name = ?");
  stmt.run(commandName);
}
