import { ApiClient } from "@twurple/api";
import { ChatClient } from "@twurple/chat";
import { CommandList } from "../types";

export default {
  name: "eat",
  description: "What do you want to eat?",
  alias: ["กินไร"],
  args: [],
  execute: async (
    client: { api: ApiClient; chat: ChatClient; io: any },
    meta: {
      user: string;
      channel: string;
      channelID: string;
      userID: string;
      commands: CommandList;
    },
    message: string,
    args: Array<string>,
  ) => {
    let foods = [
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
    ];
    let food = foods[Math.floor(Math.random() * foods.length)];
    await client.chat.say(meta.channel, `@${meta.user} 🍲 กิน ${food}`);
  },
};
