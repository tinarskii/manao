// Music player functionality

// Create socket connection using the common function
const socket = createSocketConnection();

let currentSong;
let queue;
let defaultSongs;
let defaultSongIndex = 0;

let playSeconds = 0;

fetch("/api/defaultSong")
  .then((response) => response.json())
  .then((data) => {
    defaultSongs = data.map((song) => {
      return {
        song: {
          title: song.songTitle,
          author: song.songAuthor,
          thumbnail: song.songThumbnail,
          id: song.songID,
        },
      };
    })
  });

function updateNowPlaying(song) {
  console.log(song);
  document.getElementById("songTitle").innerText = song.title;
  document.getElementById("author").innerText = song.author;
  document.getElementById("cover").src = song.thumbnail;

  document.getElementById("info-container").style.backgroundImage =
    `url(${song.thumbnail})`;
  document.getElementById("info-container").style.backgroundSize = "cover";
  document.getElementById("info-container").style.backgroundPosition = "center";
}

// Fetch the current queue, then play the first song
socket.emit("songQueueFetch");
socket.on("songQueue", (data) => {
  queue = data;
  if (queue.length > 0) {
    currentSong = queue[0];
    updateNowPlaying(currentSong.song);
    playSong(currentSong.song.id);
  } else {
    if (defaultSongIndex >= defaultSongs.length) defaultSongIndex = 0;
    updateNowPlaying(defaultSongs[defaultSongIndex].song);
    playSong(defaultSongs[defaultSongIndex].song.id);
  }
});

// On user request song using `!song-request`
socket.on("songRequest", (data) => {
  queue = data.queue;
  let index = data.index;

  if (index === 0) {
    currentSong = queue[0];
    updateNowPlaying(currentSong.song);
    playSong(currentSong.song.id);
  }
});

// On user remove the song using `!song-remove`
socket.on("songRemove", (data) => {
  queue = data;
});

// After the song ended, play the next song
socket.on("songPlayNext", (data) => {
  queue = data;

  if (queue.length === 0) {
    defaultSongIndex++;
    if (defaultSongIndex >= defaultSongs.length) defaultSongIndex = 0;
    updateNowPlaying(defaultSongs[defaultSongIndex].song);
    playSong(defaultSongs[defaultSongIndex].song.id);
  } else {
    currentSong = queue[0];
    updateNowPlaying(currentSong.song);
    playSong(currentSong.song.id);
  }
});

// On user skip the song using `!song-skip`
socket.on("songSkip", (data) => {
  queue = data;
  if (queue.length > 0) {
    currentSong = queue[0];
    updateNowPlaying(currentSong.song);
    playSong(currentSong.song.id);
  } else {
    if (defaultSongIndex >= defaultSongs.length) defaultSongIndex = 0;
    updateNowPlaying(defaultSongs[defaultSongIndex].song);
    playSong(defaultSongs[defaultSongIndex].song.id);
  }
});

let player = document.getElementById("playframe");
let ytPlayer;

window.onYouTubeIframeAPIReady = () => {
  ytPlayer = new YT.Player("playframe");
};

window.addEventListener("message", (e) => {
  if (e.origin === "https://www.youtube.com") {
    let playerData = JSON.parse(e.data);
    if (
      playerData.event === "infoDelivery" &&
      playerData.info.playerState === YT.PlayerState.ENDED
    ) {
      socket.emit("songEnded");
    }
  }
});

setInterval(() => {
  if (ytPlayer !== undefined) {
    playSeconds = ytPlayer.getCurrentTime();
    // document.getElementById("currentTime").innerText = new Date(
    //   playSeconds * 1000,
    // )
    //   .toISOString()
    //   .substr(14, 5);
    // document.getElementById("duration").innerText = new Date(
    //   ytPlayer.getDuration() * 1000,
    // )
    //   .toISOString()
    //   .substr(14, 5);
    document.getElementById("progress").value =
      (playSeconds / ytPlayer.getDuration()) * 100;

    socket.emit("currentSongProgress", {
      currentPercent: (playSeconds / ytPlayer.getDuration()) * 100,
    });
  }
}, 1000);

// On click np, hide the player or show it
document.getElementById("np").addEventListener("click", () => {
  let player = document.getElementById("player");
  if (player.style.display === "none") {
    player.style.display = "block";
  } else {
    player.style.display = "none";
  }
});

function playSong(songID) {
  player.src = `https://www.youtube.com/embed/${songID}?autoplay=1&enablejsapi=1`;
}
