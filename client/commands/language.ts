import { ApiClient } from "@twurple/api";
import { ChatClient } from "@twurple/chat";
import { CommandMeta } from "../types";
import { t } from "../helpers/i18n";
import { updateLang } from "../helpers/preference";

export default {
  name: { en: "language", th: "ภาษา" },
  description: {
    en: "Set your preferred language",
    th: "ตั้งค่าภาษาที่คุณต้องการ",
  },
  aliases: { en: ["lang"], th: [] },
  args: [
    {
      name: { en: "language", th: "ภาษา" },
      description: { en: "Language code (en/th)", th: "รหัสภาษา (en/th)" },
      required: true,
    },
  ],
  broadcasterOnly: true,
  execute: async (
    client: { api: ApiClient; chat: ChatClient; io: any },
    meta: CommandMeta,
    message: string,
    args: Array<string>,
  ) => {
    // If no language is provided, show the current language
    if (!args[0]) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("command.currentLanguage", meta.lang, meta.lang === "en" ? "English" : "ไทย")}`,
      );
      return;
    }

    // Get requested language code
    const requestedLang = args[0].toLowerCase();

    // Validate language code
    if (requestedLang !== "en" && requestedLang !== "th") {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("configuration.errorInvalidLanguage", meta.lang, "en, th")}`,
      );
      return;
    }

    // Set the new language
    updateLang(requestedLang);

    // Confirm language change
    const languageName = requestedLang === "en" ? "English" : "ไทย";
    await client.chat.say(
      meta.channel,
      `@${meta.user} ${t("configuration.currentLanguageChanged", requestedLang, languageName)}`,
    );
  },
};
