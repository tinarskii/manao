// Create socket connection
const socket = createSocketConnection();

// Elements
const status = document.getElementById('status');
const soundLog = document.getElementById('soundLog');
const audioPlayer = document.getElementById('audioPlayer');
const volumeSlider = document.getElementById('volumeSlider');
const volumeDisplay = document.getElementById('volumeDisplay');
const muteBtn = document.getElementById('muteBtn');
const hideBtn = document.getElementById('hideBtn');
const nowPlaying = document.getElementById('nowPlaying');
const currentSound = document.getElementById('currentSound');

// Volume state
let isMuted = true;
let volumeBeforeMute = 0.5;

// Initialize volume
audioPlayer.volume = 0.5;

// Update volume when slider changes
volumeSlider.addEventListener('input', () => {
  const volume = volumeSlider.value / 100;
  audioPlayer.volume = volume;
  volumeDisplay.textContent = volumeSlider.value + '%';

  // If volume is moved above 0, we're no longer muted
  if (volume > 0 && isMuted) {
    isMuted = false;
    muteBtn.textContent = 'Mute';
    muteBtn.className = 'mute-btn';
  }
});

// Mute/unmute button
muteBtn.addEventListener('click', () => {
  if (isMuted) {
    // Unmute
    audioPlayer.volume = volumeBeforeMute;
    volumeSlider.value = volumeBeforeMute * 100;
    volumeDisplay.textContent = volumeSlider.value + '%';
    muteBtn.textContent = 'Mute';
    muteBtn.className = 'mute-btn';
    isMuted = false;
  } else {
    // Mute
    volumeBeforeMute = audioPlayer.volume;
    audioPlayer.volume = 0;
    volumeSlider.value = 0;
    volumeDisplay.textContent = '0%';
    muteBtn.textContent = 'Unmute';
    muteBtn.className = 'unmute-btn';
    isMuted = true;
  }
});

// Hide button
hideBtn.addEventListener('click', () => {
  document.body.classList.toggle('hidden');
});

// Update connection status
socket.on('connect', () => {
  status.textContent = 'Connected';
  status.className = 'status connected';
  addLogEntry('Connected to server');
});

socket.on('disconnect', () => {
  status.textContent = 'Disconnected';
  status.className = 'status disconnected';
  addLogEntry('Disconnected from server');
});

// Play sound when command received
socket.on('play-sound', (data) => {
  playSound(data.url, data.name);
});

// Function to play sound
function playSound(url, name) {
  audioPlayer.src = url;
  audioPlayer.play()
    .then(() => {
      addLogEntry(`Playing sound: ${name}`);
      currentSound.textContent = name;
      nowPlaying.style.display = 'block';

      // Hide "Now Playing" when sound ends
      audioPlayer.onended = () => {
        nowPlaying.style.display = 'none';
      };
    })
    .catch(error => {
      addLogEntry(`Error playing sound: ${name} - ${error.message}`);
    });
}

// Add entry to log
function addLogEntry(message) {
  const entry = document.createElement('div');
  entry.className = 'log-entry';

  const time = new Date().toLocaleTimeString();
  entry.textContent = `[${time}] ${message}`;

  soundLog.appendChild(entry);
  soundLog.scrollTop = soundLog.scrollHeight;

  // Limit log entries
  if (soundLog.children.length > 50) {
    soundLog.removeChild(soundLog.firstChild);
  }
}