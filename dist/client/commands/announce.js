import { logger } from "../client";
export default {
    name: "announce",
    description: "Announce something!",
    alias: ["a"],
    args: [
        {
            name: "message",
            description: "The message you want to announce",
            required: true,
        },
    ],
    execute: async (client, meta, _, args) => {
        let message = args.join(" ");
        try {
            await client.api.chat.sendAnnouncement(meta.channelID, {
                message,
            });
        }
        catch (e) {
            logger.error(e);
            await client.chat.say(meta.channel, `@${meta.user} ไม่สามารถ announce ได้`);
            return;
        }
    },
};
