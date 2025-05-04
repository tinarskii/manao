async function loadQueue() {
  try {
    const res = await fetch("/api/queue");
    if (!res.ok) throw new Error("Network response was not ok");
    const data = await res.json();

    const tbody = document.getElementById("queue");
    const emptyState = document.getElementById("empty-state");
    tbody.innerHTML = "";

    if (data.length === 0) {
      emptyState.classList.remove("hidden");
      return;
    }
    emptyState.classList.add("hidden");

    data.forEach((item, idx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
            <th>${idx + 1}</th>
            <td>${item.song.title}</td>
            <td>${item.song.author}</td>
            <td>${item.user}</td>
          `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Error fetching queue:", err);
    document.getElementById("error-state").classList.remove("hidden");
  }
}

loadQueue()