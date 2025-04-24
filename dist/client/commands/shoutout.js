export default {
    name: "shoutout",
    description: "Shoutout to someone!",
    alias: ["so"],
    args: [
        {
            name: "user",
            description: "The user you want to shoutout",
            required: true,
        },
    ],
    execute: async (client, meta, message, args) => {
        let userID = (await client.api.users.getUserByName(args[0]))?.id;
        if (!userID) {
            await client.chat.say(meta.channel, `@${meta.user} ไม่พบผู้ใช้ ${args[0]}`);
            return;
        }
        try {
            await client.api.chat.shoutoutUser(meta.channelID, userID);
        }
        catch (e) {
            await client.chat.say(meta.channel, `@${meta.user} ไม่สามารถ shoutout ได้`);
            return;
        }
        await client.chat.say(meta.channel, `@${meta.user} ทุกคนมากดฟอลให้ @${args[0]} กันนะ!`);
    },
};
