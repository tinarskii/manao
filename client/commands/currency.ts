import { ApiClient } from "@twurple/api";
import { ChatClient } from "@twurple/chat";
import { CommandMeta } from "../types";
import { t } from "../helpers/i18n";
import { updateCurrency } from "../helpers/preference";

export default {
  name: { en: "currency", th: "สกุลเงิน" },
  description: {
    en: "Change the channel's currency",
    th: "เปลี่ยนสกุลเงินของช่อง",
  },
  aliases: { en: [], th: [] },
  args: [
    {
      name: { en: "currency", th: "สกุลเงิน" },
      description: {
        en: "Currency to set",
        th: "สกุลเงินที่ต้องการตั้งค่า",
      },
      required: false,
    },
  ],
  execute: async (
    client: { api: ApiClient; chat: ChatClient; io: any },
    meta: CommandMeta,
    message: string,
    args: Array<string>,
  ) => {
    const currency = args[0];
    // If no currency is provided, return the current currency
    if (!currency) {
      await client.chat.say(
        meta.channel,
        t("configuration.currentCurrency", meta.lang, meta.currency),
      );
      return;
    }
    if (meta.user !== meta.channel) {
      await client.chat.say(
        meta.channel,
        t("configuration.errorPermission", meta.lang),
      );
      return;
    }
    // Set the currency
    updateCurrency(currency);
    await client.chat.say(
      meta.channel,
      t("configuration.currentCurrencyChanged", meta.lang, currency),
    );
  },
};
