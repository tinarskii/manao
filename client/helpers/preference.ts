import { db } from "./database";
import { CommandArg } from "../types";

export function getLang() {
  let stmt = db.prepare("SELECT lang FROM preferences WHERE userID = ?");
  const lang = stmt.get(Bun.env.BROADCASTER_ID!);

  if (!lang) {
    stmt = db.prepare("INSERT INTO preferences (userID, lang) VALUES (?, ?)");
    stmt.run(Bun.env.BROADCASTER_ID!, "en");
    return "en";
  }

  return lang.lang;
}

export function updateLang(newLang: string): void {
  const stmt = db.prepare("UPDATE preferences SET lang = ? WHERE userID = ?");
  stmt.run(newLang, Bun.env.BROADCASTER_ID!);
}

export function getCurrency() {
  let stmt = db.prepare("SELECT currency FROM preferences WHERE userID = ?");
  const currency = stmt.get(Bun.env.BROADCASTER_ID!);

  if (!currency) {
    stmt = db.prepare("INSERT INTO preferences (userID, currency) VALUES (?, ?)");
    stmt.run(Bun.env.BROADCASTER_ID!, "KEEB");
    return "USD";
  }

  return currency.currency;
}

export function updateCurrency(newCurrency: string): void {
  const stmt = db.prepare("UPDATE preferences SET currency = ? WHERE userID = ?");
  stmt.run(newCurrency, Bun.env.BROADCASTER_ID!);
}

export function localizeCommandArgs(arg: CommandArg[], lang: 'en' | 'th') {
  return arg?.map((a) => {
      return {
        ...a,
        name: a.name[lang],
        description: a.description[lang],
      };
  });
}