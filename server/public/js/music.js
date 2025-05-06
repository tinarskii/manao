// Music player functionality

// Create socket connection using the common function
const socket = createSocketConnection();

let currentSong;
let queue;
let defaultSong = []; // Simplified for brevity - would contain the song list

let playSeconds = 0;

function updateNowPlaying(song) {
  document.getElementById("songTitle").innerText = song.title;
  document.getElementById("author").innerText = song.author;
  document.getElementById("cover").src = song.thumbnail;

  document.getElementById("info-container").style.backgroundImage =
    `url(${song.thumbnail})`;
  document.getElementById("info-container").style.backgroundSize = "cover";
  document.getElementById("info-container").style.backgroundPosition = "center";
}

// Fetch current queue, then play the first song
fetch("/api/queue")
  .then((response) => response.json())
  .then((data) => {
    queue = data;
    console.log(queue);
    if (queue.length > 0) {
      currentSong = queue[0];
      updateNowPlaying(queue[0].song);
      playSong(currentSong.song.id);
    } else {
      let randomSong =
        defaultSong[Math.floor(Math.random() * defaultSong.length)];
      updateNowPlaying(randomSong);
      playSong(randomSong.id);
    }
  });

socket.on("songRequest", (data) => {
  queue = data.queue;
  let index = data.index;

  if (index === 0) {
    currentSong = queue[0];
    updateNowPlaying(queue[0].song);
    playSong(currentSong.song.id);
  }
});

socket.on("songQueue", (data) => {
  queue = data;

  if (queue.length > 0) {
    if (queue[0].song.id !== currentSong.song.id) {
      currentSong = queue[0];
      updateNowPlaying(queue[0].song);
      playSong(currentSong.song.id);
    }
  } else {
    let randomSong =
      defaultSong[Math.floor(Math.random() * defaultSong.length)];
    updateNowPlaying(randomSong);
    playSong(randomSong.id);
  }
});

socket.on("songSkip", (data) => {
  queue = data;
  if (queue.length > 0) {
    currentSong = queue[0];
    updateNowPlaying(queue[0].song);
    playSong(currentSong.song.id);
  } else {
    let randomSong =
      defaultSong[Math.floor(Math.random() * defaultSong.length)];
    updateNowPlaying(randomSong);
    playSong(randomSong.id);
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
    document.getElementById("currentTime").innerText = new Date(
      playSeconds * 1000,
    )
      .toISOString()
      .substr(14, 5);
    document.getElementById("duration").innerText = new Date(
      ytPlayer.getDuration() * 1000,
    )
      .toISOString()
      .substr(14, 5);
    document.getElementById("progress").value =
      (playSeconds / ytPlayer.getDuration()) * 100;

    socket.emit('currentSongProgress', {
      currentPercent: (playSeconds / ytPlayer.getDuration()) * 100,
    })
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

// Load default songs from server
fetch("/api/default-songs")
  .then((response) => response.json())
  .then((data) => {
    defaultSong = data;
  })
  .catch((error) => {
    console.error("Error loading default songs:", error);
    // Fallback to a few default songs
    defaultSong = [];
  });
