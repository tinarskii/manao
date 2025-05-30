const socket = createSocketConnection();

const status = document.getElementById("status");
const soundLog = document.getElementById("soundLog");
const audioPlayer = document.getElementById("audioPlayer");
const volumeSlider = document.getElementById("volumeSlider");
const volumeDisplay = document.getElementById("volumeDisplay");
const muteBtn = document.getElementById("muteBtn");
const hideBtn = document.getElementById("hideBtn");
const nowPlaying = document.getElementById("nowPlaying");
const currentSound = document.getElementById("currentSound");

let isMuted = true;
audioPlayer.volume = 0;

// Slider input
volumeSlider.addEventListener("input", () => {
  const vol = volumeSlider.value / 100;
  audioPlayer.volume = vol;
  volumeDisplay.textContent = `${volumeSlider.value  }%`;
  if (vol > 0 && isMuted) {
    isMuted = false;
    muteBtn.textContent = "Mute";
    muteBtn.className = "btn btn-error";
  }
});

// Mute/unmute
muteBtn.addEventListener("click", () => {
  if (!isMuted) {
    isMuted = true;
    audioPlayer.volume = 0;
    volumeSlider.value = 0;
    volumeDisplay.textContent = "0%";
    muteBtn.textContent = "Unmute";
    muteBtn.className = "btn btn-success";
  } else {
    isMuted = false;
    audioPlayer.volume = volumeSlider.value / 100;
    muteBtn.textContent = "Mute";
    muteBtn.className = "btn btn-error";
  }
});

// Hide player UI
hideBtn.addEventListener("click", () => {
  document.body.classList.toggle("hidden");
  document.documentElement.style.background = "transparent";
});

// Connection status updates
socket.on("connect", () => {
  status.textContent = "Connected";
  status.className = "alert alert-success w-full max-w-md text-center"; // daisyUI success alert
  addLogEntry("Connected to server");
});
socket.on("disconnect", () => {
  status.textContent = "Disconnected";
  status.className = "alert alert-error w-full max-w-md text-center";
  addLogEntry("Disconnected from server");
});

// Play sound
socket.on("play-sound", ({ url, name }) => {
  audioPlayer.src = url;
  audioPlayer
    .play()
    .then(() => {
      addLogEntry(`Playing sound: ${name}`);
      currentSound.textContent = name;
      nowPlaying.classList.remove("hidden");
      audioPlayer.onended = () => nowPlaying.classList.add("hidden");
    })
    .catch((err) => addLogEntry(`Error: ${err.message}`));
});

// Log helper
function addLogEntry(msg) {
  const entry = document.createElement("div");
  entry.className = "text-sm";
  const time = new Date().toLocaleTimeString();
  entry.textContent = `[${time}] ${msg}`;
  soundLog.querySelector("div").appendChild(entry);
  soundLog.scrollTop = soundLog.scrollHeight;
  if (soundLog.children[0].childElementCount > 50) {
    soundLog.children[0].removeChild(soundLog.children[0].firstChild);
  }
}
