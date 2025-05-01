// Create socket connection
const socket = createSocketConnection();

// Default sounds
const defaultSounds = [
  { name: "Ba Dum Tss", url: "/mp3/ba-dum-tss.mp3" },
  { name: "Applause", url: "/mp3/applause.mp3" },
  { name: "Lucio Boop", url: "/mp3/boop-lucio.mp3" },
  { name: "Sombra Boop", url: "/mp3/boop-sombra.mp3" },
  { name: "Chicken Jockey", url: "/mp3/chicken-jockey.mp3" },
  { name: "Flint and Steel", url: "/mp3/flint-and-steel.mp3" },
  { name: "I... am Steve", url: "/mp3/i-am-steve.mp3" },
  { name: "Illuminati", url: "/mp3/illuminati.mp3" },
  { name: "Taco Bell", url: "/mp3/taco-bell.mp3" },
  { name: "The Nether", url: "/mp3/the-nether.mp3" },
  { name: "Vine Boom", url: "/mp3/vine-boom.mp3" },
];

// Load sounds from local storage or use defaults
let sounds =
  JSON.parse(localStorage.getItem("soundboardSounds")) || defaultSounds;

// Save sounds to local storage
function saveSounds() {
  localStorage.setItem("soundboardSounds", JSON.stringify(sounds));
}

// Modal elements
const modal = document.getElementById("editModal");
const closeModal = document.getElementById("closeModal");
const editSoundNameInput = document.getElementById("editSoundName");
const editSoundUrlInput = document.getElementById("editSoundUrl");
const saveEditSoundBtn = document.getElementById("saveEditSound");
const deleteSoundBtn = document.getElementById("deleteSound");

// Current sound being edited
let currentEditIndex = -1;

// Render sound buttons
function renderSoundButtons() {
  const soundboard = document.getElementById("soundboard");
  soundboard.innerHTML = "";

  sounds.forEach((sound, index) => {
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "sound-button";

    // Main text of the button
    const buttonText = document.createElement("span");
    buttonText.textContent = sound.name;
    buttonContainer.appendChild(buttonText);

    // Controls container
    const controlsContainer = document.createElement("div");
    controlsContainer.className = "sound-controls";

    // Edit button
    const editBtn = document.createElement("button");
    editBtn.className = "edit-btn";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent button click
      openEditModal(index);
    });
    controlsContainer.appendChild(editBtn);

    // Add controls to button
    buttonContainer.appendChild(controlsContainer);

    // Button click to play sound
    buttonContainer.addEventListener("click", () => {
      socket.emit("play-sound", { url: sound.url, name: sound.name });
    });

    soundboard.appendChild(buttonContainer);
  });
}

// Open edit modal
function openEditModal(index) {
  currentEditIndex = index;
  const sound = sounds[index];

  editSoundNameInput.value = sound.name;
  editSoundUrlInput.value = sound.url;

  modal.style.display = "block";
}

// Close modal
closeModal.addEventListener("click", () => {
  modal.style.display = "none";
});

// Close modal when clicking outside
window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

// Save edit
saveEditSoundBtn.addEventListener("click", () => {
  if (currentEditIndex >= 0) {
    const name = editSoundNameInput.value.trim();
    const url = editSoundUrlInput.value.trim();

    if (name && url) {
      sounds[currentEditIndex] = { name, url };
      saveSounds();
      renderSoundButtons();
      modal.style.display = "none";
    } else {
      alert("Please enter both a name and URL for the sound");
    }
  }
});

// Delete sound
deleteSoundBtn.addEventListener("click", () => {
  if (currentEditIndex >= 0) {
    if (confirm("Are you sure you want to delete this sound?")) {
      sounds.splice(currentEditIndex, 1);
      saveSounds();
      renderSoundButtons();
      modal.style.display = "none";
    }
  }
});

// Add new sound
document.getElementById("addSound").addEventListener("click", () => {
  const nameInput = document.getElementById("soundName");
  const urlInput = document.getElementById("soundUrl");

  const name = nameInput.value.trim();
  const url = urlInput.value.trim();

  if (name && url) {
    sounds.push({ name, url });
    saveSounds();
    renderSoundButtons();

    // Clear inputs
    nameInput.value = "";
    urlInput.value = "";
  } else {
    alert("Please enter both a name and URL for the sound");
  }
});

// Export sounds to JSON file
document.getElementById("exportBtn").addEventListener("click", () => {
  const data = JSON.stringify(sounds, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "soundboard-config.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

// Import sounds from JSON file
document.getElementById("importFile").addEventListener("change", (event) => {
  const file = event.target.files[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const importedSounds = JSON.parse(e.target.result);

        if (
          Array.isArray(importedSounds) &&
          importedSounds.every(
            (sound) =>
              typeof sound === "object" && "name" in sound && "url" in sound,
          )
        ) {
          if (
            confirm(
              `Import ${importedSounds.length} sounds? This will replace your current sounds.`,
            )
          ) {
            sounds = importedSounds;
            saveSounds();
            renderSoundButtons();
          }
        } else {
          alert("Invalid sound configuration file");
        }
      } catch (error) {
        alert("Error parsing file: " + error.message);
      }
    };

    reader.readAsText(file);
  }
});

// Reset to default sounds
document.getElementById("resetBtn").addEventListener("click", () => {
  if (
    confirm("Reset to default sounds? This will remove all your custom sounds.")
  ) {
    sounds = [...defaultSounds];
    saveSounds();
    renderSoundButtons();
  }
});

// Socket connection status
socket.on("connect", () => {
  console.log("Connected to server");
});

socket.on("connect_error", (error) => {
  console.error("Connection error:", error);
  alert("Could not connect to the server. Make sure the server is running.");
});

// Initialize
renderSoundButtons();
