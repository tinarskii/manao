import { Elysia } from "elysia";
import { songQueue } from "../../client/services/chat";
import { db } from "../../client/helpers/database";

export function registerMusicRoutes(app: Elysia) {
  // Current queue
  app.get("/api/queue", () => songQueue);

  app.get("/api/defaultSong", () => {
    const stmt = db.prepare(
      "SELECT defaultSong FROM preferences WHERE userID = ?",
    );
    let defaultSong = stmt.get(Bun.env.BROADCASTER_ID!);

    if (!defaultSong) {
      defaultSong = {
        defaultSong: JSON.stringify([
          {
            songTitle: "Sad Flower",
            songAuthor: "Reinizra",
            songThumbnail:
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQB4i7JLl4BtWz4gYzUnsx6WcYDAK74ScNGzQ&s",
            songID: "agPF9Eptt1s",
          },
        ]),
      };
    }

    // @ts-ignore
    return JSON.parse(defaultSong.defaultSong);
  });
  return app;
}
