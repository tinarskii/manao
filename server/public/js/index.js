// Update queue number
const updateQueueNumber = async () => {
  try {
    const response = await fetch('/api/queue');
    const data = await response.json();
    document.getElementById('music-queue').innerText = data.length;
  } catch (error) {
    console.error('Error fetching queue number:', error);
  }
};

// Call the function to update the queue number
updateQueueNumber();

// Update the soundboard-list
const updateSoundboardList = () => {
  const soundboardList = document.getElementById('soundboard-list');

  const soundboardSounds = JSON.parse(localStorage.getItem('soundboardSounds')) || [];
  soundboardList.innerHTML = soundboardSounds.length ?? "0";
};

// Call the function to update a soundboard list
updateSoundboardList();