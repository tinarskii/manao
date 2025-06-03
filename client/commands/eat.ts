import { ApiClient } from "@twurple/api";
import { ChatClient } from "@twurple/chat";
import { CommandMeta } from "../../types";
import { t } from "../../helpers/i18n";

export default {
  name: { en: "eat", th: "กินอะไรดี" },
  description: { en: "What do you want to eat?", th: "อยากกินอะไรดี?" },
  aliases: { en: [], th: ["กินอะไร", "กินไร"] },
  args: [],
  execute: async (
    client: { api: ApiClient; chat: ChatClient; io: any },
    meta: CommandMeta,
  ) => {
    const foods = {
      th: [
        "ข้าว",
        "ก๋วยเตี๋ยว",
        "ส้มตำ",
        "ไก่ทอด",
        "ขนมจีน",
        "สเต็ก",
        "ไก่ย่าง",
        "หมูกระทะ",
        "หมูทอด",
        "หมูสะเต๊ะ",
        "หมูกรอบ",
        "หมูย่าง",
        "หมูทอดกรอบ",
        "หมูสามชั้น",
        "หมูสับ",
      ],
      en: [
        "rice",
        "noodles",
        "som tam",
        "fried chicken",
        "kanom jeen",
        "steak",
        "grilled chicken",
        "mookata",
        "fried pork",
        "moo satay",
        "crispy pork",
        "grilled pork",
        "crispy fried pork",
        "pork belly",
        "minced pork",
      ],
    };
    const food =
      foods[meta.lang][Math.floor(Math.random() * foods[meta.lang].length)];
    await client.chat.say(
      meta.channel,
      `@${meta.user} ${t("misc.eat", meta.lang, food)}`,
    );
  },
};
