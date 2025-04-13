import { ApiClient } from "@twurple/api";
import { ChatClient } from "@twurple/chat";
import { CommandList } from "../client";

export default {
  name: "help",
  description: "ดูคำสั่งทั้งหมดที่ใช้ได้",
  alias: ["h", "commands", "command"],
  args: [
    {
      name: "command",
      description: "Command name",
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
    if (args.length > 0) {
      // get cmd description, its args, and args description
      const cmd = meta.commands.get(args[0]);
      if (!cmd) {
        await client.chat.say(
          meta.channel,
          `@${meta.user} ไม่พบคำสั่ง ${args[0]}`,
        );
        return;
      }
      let argsDescription = "";
      let argsAlias = "";
      if (cmd.args) {
        argsDescription = cmd.args
          .map((arg) => {
            if (arg.required) {
              return ` | <${arg.name}> - ${arg.description}`;
            } else {
              return ` | [${arg.name}] - ${arg.description}`;
            }
          })
          .join("");
      }
      if (cmd.alias) {
        argsAlias = " (" + cmd.alias.join(", ") + ")";
      }
      await client.chat.say(
        meta.channel,
        `📚 ${cmd.name}${argsAlias}: ${cmd.description}${argsDescription}`,
      );
    } else {
      await client.chat.say(
        meta.channel,
        `@${meta.user} 📚 ดูคำสั่งทั้งหมดได้ที่ https://bit.ly/manaobot ได้เลยนะครับ หรือ พิมพ์ !help ตามด้วยคำสั่ง เพื่อดูรายละเอียดของคำสั่งนั้น ๆ ครับ`,
      );
    }
  },
};
