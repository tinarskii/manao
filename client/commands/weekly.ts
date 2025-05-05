import { CommandList } from "../types";
import { db } from "../helpers/database";
import { ApiClient } from "@twurple/api";
import { ChatClient } from "@twurple/chat";
import { initAccount } from "../helpers/twitch";

export default {
  name: "weekly",
  description: "Give weekly money (750 Keeb)",
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

    // Find last weekly (Int)
    let stmt = db.prepare("SELECT lastWeekly FROM users WHERE user = ?");
    const lastWeekly = stmt.get(meta.userID);

    // Check if user has claimed weekly
    if (lastWeekly) {
      const lastWeeklyDate = new Date(lastWeekly.lastWeekly);
      const currentDate = new Date();
      const diff = Math.abs(currentDate.getTime() - lastWeeklyDate.getTime());
      const diffDays = Math.ceil(diff / (1000 * 3600 * 24));
      if (diffDays < 7) {
        await client.chat.say(
          meta.channel,
          `เองรับเงินไปแล้ว รออีก ${7 - diffDays} วัน`,
        );
        return;
      }
    }

    // Claim weekly (Add money, Update lastWeekly)
    stmt = db.prepare("UPDATE users SET money = money + 750 WHERE user = ?");
    stmt.run(meta.userID);
    stmt = db.prepare("UPDATE users SET lastWeekly = ? WHERE user = ?");
    stmt.run(Number(new Date()), meta.userID);

    client.io.emit("feed", {
      type: "normal",
      icon: "☀️",
      message: `System ➡ ${meta.user}`,
      action: "+750 KEEB",
    });
    await client.chat.say(meta.channel, `@${meta.user} รับ 750 กีบ`);
  },
};
