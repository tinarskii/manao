import { CommandMeta, UserData } from "../../types";
import { db, initAccount } from "../../helpers/database";
import { ApiClient } from "@twurple/api";
import { ChatClient } from "@twurple/chat";
import { t } from "../../helpers/i18n";

export default {
  name: { en: "nickname", th: "ชื่อเล่น" },
  description: {
    en: "Change or show your nickname",
    th: "เปลี่ยนหรือแสดงชื่อเล่นของคุณ",
  },
  aliases: { en: ["nick", "name"], th: ["ชื่อ"] },
  args: [
    {
      name: { en: "nickname", th: "ชื่อเล่น" },
      description: { en: "Your new nickname", th: "ชื่อเล่นใหม่ของคุณ" },
      required: false,
    },
  ],
  execute: async (
    client: { api: ApiClient; chat: ChatClient; io: any },
    meta: CommandMeta,
    message: string,
    args: Array<string>,
  ) => {
    const name = args.join(" ");

    initAccount(meta.userID);

    // Check current nickname
    if (!args[0]) {
      const stmt = db.prepare("SELECT nickname FROM users WHERE user = ?");
      const { nickname } = stmt.get(meta.userID) as Pick<UserData, "nickname">;
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("configuration.currentNickname", meta.lang, nickname || meta.user)}`,
      );
      return;
    }

    // Reset nickname
    if (["remove", "reset", "clear"].includes(name)) {
      const stmt = db.prepare("UPDATE users SET nickname = ? WHERE user = ?");
      stmt.run(null, meta.userID);
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("configuration.currentNicknameRemoved", meta.lang)}`,
      );
      return;
    }

    // Check if name is too long
    if (name.length > 32) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("configuration.errorNicknameTooLong", meta.lang)}`,
      );
      return;
    }

    // Check if name is in english or thai
    if (!name.match(/^[a-zA-Z0-9ก-๙ ]+$/)) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("configuration.errorNicknameContainsSpecialChars", meta.lang)}`,
      );
      return;
    }

    // Update name
    const stmt = db.prepare("UPDATE users SET nickname = ? WHERE user = ?");
    stmt.run(name, meta.userID);
    await client.chat.say(
      meta.channel,
      `@${meta.user} ${t("configuration.currentNicknameChanged", meta.lang, name)}`,
    );
    client.io.emit("feed", {
      type: "normal",
      icon: "✍️",
      message: `${meta.user} (${name})`,
      action: "Rename",
    });
  },
};
