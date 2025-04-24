export default {
    name: "hate",
    description: "For whom do you hate?",
    alias: ["เกลียด"],
    args: [
        {
            name: "user",
            description: "The user you hate",
            required: false,
        },
    ],
    execute: async (client, meta, message, args) => {
        let hatePercent = Math.floor(Math.random() * 101);
        await client.chat.say(meta.channel, `${meta.user} 👿 ${args[0] || meta.user} ${hatePercent}%`);
    },
};
