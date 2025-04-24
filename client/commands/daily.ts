import { CommandList } from "../client";
import { db } from "../helpers/database";
import { ApiClient } from "@twurple/api";
import { ChatClient } from "@twurple/chat";
import { initAccount } from "../helpers/twitch";

export default {
  name: "daily",
  description: "Give daily money (100 Keeb)",
  alias: [],
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
    initAccount(meta.userID);

    // Find last daily (Int)
    let stmt = db.prepare("SELECT lastDaily FROM users WHERE user = ?");
    let lastDaily = stmt.get(meta.userID);

    // Check if user has claimed daily
    if (lastDaily) {
      let lastDailyDate = new Date(lastDaily.lastDaily);
      let currentDate = new Date();
      if (
        lastDailyDate.getDate() === currentDate.getDate() &&
        lastDailyDate.getMonth() === currentDate.getMonth() &&
        lastDailyDate.getFullYear() === currentDate.getFullYear()
      ) {
        await client.chat.say(
          meta.channel,
          `@${meta.user} เองรับเงินไปแล้ววันนี้แล้วนะ`,
        );
        return;
      }
    }

    // Claim daily (Add money, Update lastDaily)
    stmt = db.prepare("UPDATE users SET money = money + 100 WHERE user = ?");
    stmt.run(meta.userID);
    stmt = db.prepare("UPDATE users SET lastDaily = ? WHERE user = ?");
    stmt.run(Number(new Date()), meta.userID);

    await client.chat.say(meta.channel, `@${meta.user} รับ 100 กีบ`);
    client.io.emit("feed", {
      type: "normal",
      icon: "☀️",
      message: `System ➡ ${meta.user}`,
      action: `+ 100 KEEB`,
    });
  },
};
