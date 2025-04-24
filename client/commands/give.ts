import { CommandList } from "../client";
import { db } from "../helpers/database";
import { ApiClient } from "@twurple/api";
import { ChatClient } from "@twurple/chat";
import { initAccount } from "../helpers/twitch";

export default {
  name: "give",
  description: "Give money to someone else",
  alias: ["transfer"],
  args: [
    {
      name: "user",
      description: "The user you want to give money",
      required: true,
    },
    {
      name: "amount",
      description: "The amount of money you want to give",
      required: true,
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
    let amount = Math.trunc(parseInt(args[1]));
    let target = args[0];

    // Check if amount is valid
    if (isNaN(amount) || amount < 0) {
      await client.chat.say(meta.channel, `@${meta.user} ใส่ตังเข้ามาด้วย`);
      return;
    }

    // Check if user has enough money
    let stmt = db.prepare("SELECT money FROM users WHERE user = ?");
    let balance = stmt.get(meta.userID);
    if (!stmt.get(meta.userID)) {
      initAccount(meta.userID);
      balance = { money: 0 };
    }
    if (amount > balance.money) {
      await client.chat.say(meta.channel, `@${meta.user} เองมีตังไม่พอ`);
      return;
    }

    // Check if target is valid
    let targetUser = await client.api.users.getUserByName(target);
    if (!targetUser) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ไม่พบผู้ใช้ ${args[0]}`,
      );
      return;
    }
    let targetID = targetUser.id;
    initAccount(targetID);

    // Transfer money
    stmt = db.prepare("UPDATE users SET money = money - ? WHERE user = ?");
    stmt.run(amount, meta.userID);
    stmt = db.prepare("UPDATE users SET money = money + ? WHERE user = ?");
    stmt.run(amount, targetID);
    await client.chat.say(
      meta.channel,
      `@${meta.user} โอน ${amount} กีบ ให้ ${target}`,
    );
    client.io.emit("feed", {
      type: "normal",
      icon: "📩",
      message: `${meta.user} ➡ ${target}`,
      action: `${amount} KEEB`,
    });
  },
};
