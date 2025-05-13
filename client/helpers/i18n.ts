import { translations } from "../config/translations";

/**
 * Internationalization helper function
 * @param key The translation key in dot notation (e.g., 'song.queueEmpty')
 * @param lang The language code ('en' or 'th')
 * @param params Optional parameters to replace {} placeholders in the string
 * @returns The translated string with parameters replaced
 */
export function t(key: string, lang: string, ...params: any[]): string {
  // Split the key by dots to navigate the translation object
  const keys = key.split(".");

  // Navigate to the translation
  // @ts-ignore
  let translation: any = translations[lang];
  for (const k of keys) {
    if (!translation || !translation[k]) {
      // Fallback to English if translation not found
      if (lang !== "en") {
        return t(key, "en", ...params);
      }
      return key; // Return the key if no translation found
    }
    translation = translation[k];
  }

  // Replace parameters in the translation
  if (typeof translation === "string" && params.length > 0) {
    return params.reduce((str, param, index) => {
      return str.replace("{}", param.toString());
    }, translation);
  }

  return translation;
}
