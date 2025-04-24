// Queue functionality

// Fetch the queue data from the API
fetch("/api/queue")
  .then((response) => response.json())
  .then((data) => {
    const queue = document.getElementById("queue");
    data.forEach((song) => {
      const li = document.createElement("li");
      li.textContent =
        song.song.title +
        " - " +
        song.song.author +
        " | " +
        `Requested by: ${song.user}`;
      queue.appendChild(li);
    });
  })
  .catch((error) => {
    console.error("Error fetching queue:", error);
    const queue = document.getElementById("queue");
    const li = document.createElement("li");
    li.textContent = "Error loading queue data";
    li.style.color = "red";
    queue.appendChild(li);
  });
