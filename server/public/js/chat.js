// Chat functionality

// Create socket connection using the common function
const socket = createSocketConnection();

// Get query parameters
const fade = getParam("fade");
const direction = getParam("direction") === "ttb" ? "column-reverse" : "column";

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

// Set direction on #log container
document.getElementById("log").style.flexDirection = direction;

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

  const chatElement = chat.firstElementChild; // reference to actual <div> being inserted

  chatElement.querySelector(".chatbox-container").style.borderColor =
    data.color;

  if (data.badges) {
    const badges = chatElement.querySelector(".badges");
    data.badges.forEach((badge) => {
      const img = document.createElement("img");
      img.src = badge;
      badges.appendChild(img);
    });
  }

  log.appendChild(chatElement);

  // Fade out the chat message after a specified time
  if (parseFloat(fade) > 0) {
    setTimeout(
      () => {
        chatElement.classList.add("chat-exit");
        setTimeout(() => chatElement.remove(), 1000); // matches animation duration
      },
      parseFloat(fade) * 1000,
    );
  }
});
