// queue.js
let currentSongId = null;
let socket = createSocketConnection();

// Listen for song progress updates
socket.on('currentSongProgress', (data) => {
  updateProgressBar(data.currentPercent);
});


async function loadQueue() {
  try {
    const res = await fetch("/api/queue");
    if (!res.ok) throw new Error("Network response was not ok");
    const data = await res.json();

    const tbody = document.getElementById("queue");
    const emptyState = document.getElementById("empty-state");
    const nowPlayingSection = document.getElementById("now-playing-section");
    const nowPlayingContent = document.getElementById("now-playing-content");

    tbody.innerHTML = "";

    // Handle empty queue
    if (data.length === 0) {
      emptyState.classList.remove("hidden");
      nowPlayingSection.classList.add("hidden");
      return;
    }

    emptyState.classList.add("hidden");

    // Set up "Now Playing" section with first item
    const nowPlaying = data[0];
    nowPlayingSection.classList.remove("hidden");

    // Create YouTube watch URL
    const youtubeUrl = `https://www.youtube.com/watch?v=${nowPlaying.song.id}`;

    // Reset progress animation if song changed
    if (currentSongId !== nowPlaying.song.id) {
      currentSongId = nowPlaying.song.id;
      // Don't need to reset progress bar as it will be updated via socket
    }

    nowPlayingContent.innerHTML = `
      <div class="flex flex-col md:flex-row items-center gap-4">
        <div class="flex-shrink-0">
          <a href="${youtubeUrl}" target="_blank" rel="noopener noreferrer">
            <img 
              src="${nowPlaying.song.thumbnail}" 
              alt="${nowPlaying.song.title}" 
              class="rounded-lg shadow-md w-32 h-32 object-cover"
            />
          </a>
        </div>
        <div class="flex-grow text-center md:text-left">
          <h3 class="font-bold text-xl truncate">${nowPlaying.song.title}</h3>
          <p class="text-md opacity-80">by ${nowPlaying.song.author}</p>
          <p class="text-sm mt-2">Requested by: ${nowPlaying.user}</p>
          <div class="mt-3">
            <a href="${youtubeUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
              </svg>
              Watch on YouTube
            </a>
          </div>
        </div>
      </div>
    `;

    // Populate the rest of the queue (starting from index 1)
    const queueItems = data.slice(1);

    if (queueItems.length === 0) {
      document.getElementById("upcoming-queue-section").classList.add("hidden");
    } else {
      document.getElementById("upcoming-queue-section").classList.remove("hidden");

      queueItems.forEach((item, idx) => {
        const tr = document.createElement("tr");
        tr.className = idx % 2 === 0 ? "hover" : "hover bg-base-300";

        // Create YouTube watch URL for this item
        const itemYoutubeUrl = `https://www.youtube.com/watch?v=${item.song.id}`;

        // Truncate long titles
        const truncatedTitle = item.song.title.length > 40
          ? item.song.title.substring(0, 40) + "..."
          : item.song.title;

        tr.innerHTML = `
          <th>
            <div class="flex items-center justify-center w-6 h-6 rounded-full bg-secondary text-secondary-content">
              ${idx + 1}
            </div>
          </th>
          <td>
            <div class="flex items-center space-x-3">
              <div class="avatar">
                <div class="mask mask-squircle w-12 h-12">
                  <img src="${item.song.thumbnail}" alt="${item.song.title}" />
                </div>
              </div>
              <div>
                <div class="font-bold">${truncatedTitle}</div>
                <div class="text-sm opacity-70 md:hidden">${item.song.author}</div>
              </div>
            </div>
          </td>
          <td class="hidden md:table-cell">${item.song.author}</td>
          <td class="hidden sm:table-cell">
            <div class="flex items-center gap-2">
              <span>${item.user}</span>
            </div>
          </td>
          <td>
            <a href="${itemYoutubeUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-ghost btn-xs">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
              </svg>
            </a>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }
  } catch (err) {
    console.error("Error fetching queue:", err);
    document.getElementById("error-state").classList.remove("hidden");
    document.getElementById("now-playing-section").classList.add("hidden");
    document.getElementById("upcoming-queue-section").classList.add("hidden");
  }
}

// Function to update progress bar with real data
function updateProgressBar(percentComplete) {
  const progressBar = document.getElementById("song-progress");
  if (!progressBar) return;

  // Update the width based on the percentage from the socket
  progressBar.style.width = `${percentComplete}%`;
}

// Initial load
loadQueue();

// Auto-refresh
setInterval(() => {
  loadQueue();
}, 30000); // Refresh every 30 seconds