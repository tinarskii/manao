import { songQueue } from "../client";
export default {
    name: "song-remove",
    description: "Remove a song",
    alias: ["remove", "rm"],
    args: [
        {
            name: "index",
            description: "The index of the song to remove",
            required: true,
        },
    ],
    execute: async (client, meta, message, args) => {
        let index = parseInt(args[0]);
        if (isNaN(index) || index <= 0 || index >= songQueue.length) {
            await client.chat.say(meta.channel, `@${meta.user} ใส่เลขคิวที่ถูกต้องด้วย`);
            return;
        }
        // Check if user has permission to remove song (Requester or Mod)
        if (songQueue[index].user !== meta.user) {
            let isMod = await client.api.moderation.checkUserMod(meta.channelID, meta.userID);
            if (!isMod) {
                await client.chat.say(meta.channel, `@${meta.user} ไม่สามารถลบเพลงของคนอื่นได้`);
                return;
            }
        }
        songQueue.splice(index + 1, 1);
        client.io.emit("songQueue", songQueue);
        await client.chat.say(meta.channel, `@${meta.user} ลบเพลง #${index} "${songQueue[index].song.title}" แล้ว (คิว ${songQueue.length} เพลง)`);
    },
};
