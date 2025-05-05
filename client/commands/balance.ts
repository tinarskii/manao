import { CommandList } from "../types";
import { db } from "../helpers/database";
import { ApiClient } from "@twurple/api";
import { ChatClient } from "@twurple/chat";
import { initAccount } from "../helpers/twitch";

export default {
  name: "balance",
  description: "Check your balance",
  alias: ["bal", "money"],
  args: [
    {
      name: "user",
      description: "User to check balance",
      type: "string",
      required: false,
    },
  ],
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
    const user = await client.api.users.getUserByName(args[0] ?? meta.user);

    // If user is not found
    if (!user) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ไม่พบผู้ใช้ ${args[0]}`,
      );
      return;
    }

    // Init bank
    initAccount(user.id);

    // Get balance
    const stmt = db.prepare("SELECT money FROM users WHERE user = ?");
    const balance = stmt.get(user.id);

    // If user is not found
    if (!balance) {
      await client.chat.say(
        meta.channel,
        `ไม่มีบัญชีของ ${user.displayName} ในระบบ`,
      );
      return;
    }

    client.io.emit("feed", {
      type: "normal",
      icon: "👛",
      message: `${meta.user}`,
      action: `${balance.money} KEEB`,
    });
    await client.chat.say(
      meta.channel,
      `${user.displayName} มีตัง ${balance.money} กีบ`,
    );
  },
};
