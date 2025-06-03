import { ApiClient } from "@twurple/api";
import { ChatClient } from "@twurple/chat";
import { CommandMeta } from "../../types";
import { version } from "../../package.json";
import { version as twurpleVersion } from "@twurple/api/package.json";
import { t } from "../../helpers/i18n";

export default {
  name: { en: "version", th: "เวอร์ชัน" },
  description: {
    en: "Check bot's current version",
    th: "ตรวจสอบเวอร์ชันของบอท",
  },
  aliases: { en: ["v", "ver"], th: [] },
  execute: async (
    client: { api: ApiClient; chat: ChatClient; io: any },
    meta: CommandMeta,
  ) => {
    const MANAO_VERSION = version;
    const BUN_VERSION = Bun.version;
    const TWURPLE_VERSION = twurpleVersion;

    await client.chat.say(
      meta.channel,
      `@${meta.user} ${t("info.version", meta.lang, MANAO_VERSION, BUN_VERSION, TWURPLE_VERSION)}`,
    );
  },
};
