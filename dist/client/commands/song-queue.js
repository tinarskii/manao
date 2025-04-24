import { songQueue } from "../client";
export default {
    name: "song-queue",
    description: "Check song queue",
    alias: ["queue", "sq"],
    execute: async (client, meta, message, args) => {
        if (songQueue.length === 0) {
            await client.chat.say(meta.channel, `@${meta.user} ไม่มีเพลงในคิว`);
            return;
        }
        await client.chat.say(meta.channel, `@${meta.user} ดูคิวเพลงได้ที่ https://my.tinarskii.com:3000/queue นะคะ!`);
    },
};
