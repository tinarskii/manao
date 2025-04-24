// Feed functionality

// Create socket connection using the common function
const socket = createSocketConnection();

socket.on("feed", (data) => {
  const feedlist = document.querySelector(".feedlist");
  const feed = document.createElement("div");
  feed.classList.add("feed-container", data.type);
  feed.innerHTML = `
        <h1>${data.icon}</h1>
        <h1 style="text-align: start">${data.message}</h1>
        <h1 style="text-align: end">${data.action}</h1>
    `;
  feedlist.appendChild(feed);
});
