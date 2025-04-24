export default {
    name: "love",
    description: "How deep is your love?",
    alias: ["รัก"],
    args: [
        {
            name: "user",
            description: "The user you love",
            required: false,
        },
    ],
    execute: async (client, meta, message, args) => {
        let lovePercent = String(Math.floor(Math.random() * 101));
        if (["ในหลวง", "พ่อหลวง", "พ่อ", "ร.๙", "รัชกาลที่ ๙", "king rama IX", "rama IX", "king"].includes(meta.user.toLowerCase()))
            lovePercent = "๙๙";
        client.io.emit("feed", { type: "neutral",
            icon: "💘",
            message: `${meta.user} ➡ ${args[0] || meta.user}`,
            action: `${lovePercent}%`,
        });
        await client.chat.say(meta.channel, `${meta.user} 💘 ${args[0] || meta.user} ${lovePercent}%`);
    },
};
