// Chat functionality

// Create socket connection using the common function
const socket = createSocketConnection();

// Add the template script programmatically to avoid issues with curly braces
document.getElementById("template-container").innerHTML = `
<script id="chatlist_item" type="text/template">
  <div data-from="{from}" data-id="{messageId}">
    <div class="chatbox-container {role}" id="{messageId}-container">
      <div class="meta" style="color: {color}">
        <span class="name" id="{messageId}-author">{from}</span>
        <span class="badges"></span>
      </div>
      <div class="message" id="{messageId}-msg">
        {message}
      </div>
    </div>
  </div>
</script>
`;

socket.on("message", (data) => {
  const log = document.getElementById("log");
  const chat = document.createElement("div");
  chat.innerHTML = document
    .getElementById("chatlist_item")
    .innerHTML.replace(/{from}/g, data.from)
    .replace(/{messageId}/g, data.id)
    .replace(/{message}/g, data.message)
    .replace(/{role}/g, data.role)
    .replace(/{color}/g, data.color);
  chat.querySelector(".chatbox-container").style.borderColor = data.color;
  if (data.badges) {
    const badges = chat.querySelector(".badges");
    data.badges.forEach((badge) => {
      const img = document.createElement("img");
      img.src = badge;
      badges.appendChild(img);
    });
  }
  log.appendChild(chat);
});
