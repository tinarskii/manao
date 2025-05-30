import { ApiClient } from "@twurple/api";
import { ChatClient } from "@twurple/chat";
import { CommandMeta } from "../types";

export default {
  name: { en: "love", th: "รัก" },
  description: { en: "How deep is your love?", th: "ความรักของคุณลึกแค่ไหน?" },
  aliases: { en: [], th: [] },
  args: [
    {
      name: { en: "user", th: "ผู้ใช้" },
      description: { en: "The user you love", th: "ผู้ใช้ที่คุณรัก" },
      required: false,
    },
  ],
  execute: async (
    client: { api: ApiClient; chat: ChatClient; io: any },
    meta: CommandMeta,
    message: string,
    args: Array<string>,
  ) => {
    let lovePercent = String(Math.floor(Math.random() * 101));
    if (
      [
        "ในหลวง",
        "พ่อหลวง",
        "พ่อ",
        "ร.๙",
        "รัชกาลที่ ๙",
        "king rama ix",
        "rama ix",
        "king",
      ].includes(args[0]?.toLowerCase() || meta.user.toLowerCase())
    )
      lovePercent = "๙๙";
    client.io.emit("feed", {
      type: "neutral",
      icon: "💘",
      message: `${meta.user} ➡ ${args[0] || meta.user}`,
      action: `${lovePercent}%`,
    });
    await client.chat.say(
      meta.channel,
      `${meta.user} 💘 ${args[0] || meta.user} ${lovePercent}%`,
    );
  },
};
