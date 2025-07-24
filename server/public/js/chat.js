// Create socket connection using the common function
const socket = createSocketConnection();

let isOverrideCSS = false;

function addImportantToCSS(cssText) {
  return cssText.replace(/([^;\s}]+)\s*:\s*([^;}{]+)(;?)/g, (match, prop, val, semi) => {
    if (val.trim().endsWith('!important')) {
      return match; // Already has !important
    }
    return `${prop}: ${val.trim()} !important${semi}`;
  });
}

// Load and apply custom CSS from localStorage
function loadAndApplyCustomCSS() {
  try {
    const customCSS = localStorage.getItem("chatCustomCSS");
    if (!customCSS || !customCSS.trim()) return (isOverrideCSS = false);

    // Remove any previous custom CSS
    const existingStyle = document.querySelector(
      'style[data-custom-css="true"]',
    );
    if (existingStyle) existingStyle.remove();

    // Split out @import rules to put them at the top
    const importRegex = /@import\s+url\([^)]+\);/gi;
    const importRules = customCSS.match(importRegex) || [];
    const cssWithoutImports = customCSS.replace(importRegex, "").trim();
    const cssImportants = addImportantToCSS(cssWithoutImports);

    // Create a <style> tag with imports first
    const styleElement = document.createElement("style");
    styleElement.setAttribute("data-custom-css", "true");
    styleElement.textContent = `${importRules.join("\n")}\n${cssImportants}`;
    document.head.appendChild(styleElement);

    isOverrideCSS = true;
  } catch (error) {
    console.error("❌ Error loading custom CSS:", error);
  }
}

// Apply custom CSS immediately
loadAndApplyCustomCSS();

// Get query parameters
function getParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

const fontSize = getParam("fontSize") || "20";
const fontFamily = getParam("fontFamily") || "Outfit, Noto Sans Thai Looped";
const textColor = getParam("textColor") || "#ffffff";
const backgroundOpacity = getParam("backgroundOpacity") || "0.85";
const borderRadius = getParam("borderRadius") || "16";
const boxShadow = getParam("boxShadow") === "true";
const textShadow = getParam("textShadow") === "true";
const hideBadges = getParam("hideBadges") === "true";
const animationIn = getParam("animationIn") || "slideInRight";
const animationOut = getParam("animationOut") || "slideOutLeft";
const timeout = getParam("timeout") || "10000";
const limit = getParam("limit") || "5";
const messageDirection = getParam("messageDirection") || "bottom";
const align = getParam("align") || "left";
const normalBg = getParam("normalBg") || "4e4e48,38342b";
const subBg = getParam("subBg") || "8a8a0b,b58923";
const vipBg = getParam("vipBg") || "320b4d,6b136b";
const modBg = getParam("modBg") || "0c4d0b,157426";
const broadcasterBg = getParam("broadcasterBg") || "4d0b0b,6b1320";

// Parse background colors
function parseBgColors(bgString) {
  const colors = bgString.split(",");
  return {
    color1: colors[0] ? `#${colors[0]}` : "#4e4e48",
    color2: colors[1] ? `#${colors[1]}` : "#38342b",
  };
}

const bgColors = {
  normal: parseBgColors(normalBg),
  sub: parseBgColors(subBg),
  vip: parseBgColors(vipBg),
  mod: parseBgColors(modBg),
  broadcaster: parseBgColors(broadcasterBg),
};

// Add dynamic CSS for animations and background colors
function injectDynamicCSS() {
  const style = document.createElement("style");
  style.setAttribute("data-dynamic-css", "true");
  style.textContent = `
    /* Alignment styles */
    .align-left {
      align-self: flex-start;
      max-width: 80%;
    }
    .align-center {
      align-self: center;
      max-width: 80%;
    }
    .align-right {
      align-self: flex-end;
      max-width: 80%;
    }

    /* Text shadow override */
    .no-text-shadow .meta,
    .no-text-shadow .message {
      text-shadow: none !important;
    }

    /* Custom background colors */
    .chatbox-container.normal {
      background: linear-gradient(45deg, ${bgColors.normal.color1}, ${bgColors.normal.color2}) !important;
    }
    .chatbox-container.sub {
      background: linear-gradient(45deg, ${bgColors.sub.color1}, ${bgColors.sub.color2}) !important;
    }
    .chatbox-container.vip {
      background: linear-gradient(45deg, ${bgColors.vip.color1}, ${bgColors.vip.color2}) !important;
    }
    .chatbox-container.mod {
      background: linear-gradient(45deg, ${bgColors.mod.color1}, ${bgColors.mod.color2}) !important;
    }
    .chatbox-container.broadcaster {
      background: linear-gradient(45deg, ${bgColors.broadcaster.color1}, ${bgColors.broadcaster.color2}) !important;
    }
  `;
  document.head.appendChild(style);
}

// Initialize dynamic CSS
injectDynamicCSS();

// Add the template script programmatically
document.getElementById("template-container").innerHTML = `
<script id="chatlist_item" type="text/template">
  <div data-from="{from}" data-id="{messageId}">
    <div class="chatbox-container {role}" id="{messageId}-container">
      <div class="meta" style="color: {color}">
        <span class="badges"></span>
        <span class="username" id="{messageId}-author">{from}</span>
      </div>
      <div class="message" id="{messageId}-msg">
        {message}
      </div>
    </div>
  </div>
</script>
`;

// Set direction on #log container
const logContainer = document.getElementById("log");
logContainer.style.flexDirection =
  messageDirection === "bottom" ? "column-reverse" : "column";

// Track message count for limit enforcement
let messageCount = 0;

socket.on("message", (data) => {
  const log = document.getElementById("log");
  const chat = document.createElement("div");

  // Create message element
  chat.innerHTML = document
    .getElementById("chatlist_item")
    .innerHTML.replace(/{from}/g, data.from)
    .replace(/{messageId}/g, data.id)
    .replace(/{message}/g, data.message)
    .replace(/{role}/g, data.role)
    .replace(/{color}/g, data.color);

  const chatElement = chat.firstElementChild;
  const container = chatElement.querySelector(".chatbox-container");

  // Add badges if not hidden
  if (data.badges && !hideBadges) {
    const badges = chatElement.querySelector(".badges");
    data.badges.forEach((badge) => {
      const img = document.createElement("img");
      img.src = badge;
      img.className = "inline-block w-4 h-4 mr-1";
      img.alt = `${data.role} badge`;
      badges.appendChild(img);
    });
  }

  // Apply styling
  if (isOverrideCSS) {
    container.classList.add(animationIn);
    container.style.borderRadius = `${borderRadius}px`;
    container.style.fontFamily = fontFamily;
    container.style.boxShadow = boxShadow
      ? "0 2px 8px rgba(0,0,0,0.25)"
      : "none";
    container.style.textAlign = align;
    container.style.fontSize = `${fontSize}px`;
    container.style.color = textColor;

    // Apply text shadow setting
    if (!textShadow) {
      container.classList.add("no-text-shadow");
    } else {
      // Apply text shadow to username and message
      const username = container.querySelector(".username");
      const message = container.querySelector(".message");
      if (username) username.style.textShadow = "0 2px 8px rgba(0,0,0,0.7)";
      if (message) message.style.textShadow = "0 2px 8px rgba(0,0,0,0.7)";
    }

    // Apply background opacity to the role-based background
    const roleColors = bgColors[data.role] || bgColors.normal;
    const bgWithOpacity = `linear-gradient(45deg, 
    rgba(${hexToRgb(roleColors.color1)}, ${backgroundOpacity}), 
    rgba(${hexToRgb(roleColors.color2)}, ${backgroundOpacity}))`;
    container.style.background = bgWithOpacity;

    // Apply border styling based on alignment
    switch (align) {
      case "center":
        container.style.borderLeft = "none";
        container.style.borderRight = "none";
        container.style.borderBottom = `10px solid ${data.color}`;
        break;
      case "right":
        container.style.borderLeft = "none";
        container.style.borderBottom = "none";
        container.style.borderRight = `10px solid ${data.color}`;
        break;
      default:
        container.style.borderRight = "none";
        container.style.borderBottom = "none";
        container.style.borderLeft = `10px solid ${data.color}`;
    }

    // Add data attributes for CSS targeting
    container.setAttribute("data-role", data.role);
    container.classList.add(`align-${align}`);
  }

  // Add to log
  log.appendChild(chatElement);
  messageCount++;

  // Enforce message limit
  const limitNum = parseInt(limit);
  if (limitNum > 0 && messageCount > limitNum) {
    const oldMessages = log.children;
    const messagesToRemove = messageCount - limitNum;
    for (let i = 0; i < messagesToRemove && oldMessages.length > 0; i++) {
      const oldestMessage =
        messageDirection === "bottom"
          ? oldMessages[oldMessages.length - 1]
          : oldMessages[0];
      if (oldestMessage) {
        oldestMessage.remove();
        messageCount--;
      }
    }
  }

  // Auto-remove message after timeout
  if (parseFloat(timeout) > 0) {
    setTimeout(() => {
      if (chatElement && chatElement.parentNode) {
        const containerToAnimate =
          chatElement.querySelector(".chatbox-container");
        if (containerToAnimate) {
          containerToAnimate.classList.remove(animationIn);
          containerToAnimate.classList.add(animationOut);
        }
        setTimeout(() => {
          if (chatElement && chatElement.parentNode) {
            chatElement.remove();
            messageCount--;
          }
        }, 750); // Animation duration
      }
    }, parseFloat(timeout));
  }
});

// Helper function to convert hex to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : "78, 78, 72";
}

// Listen for localStorage changes to update custom CSS in real-time
window.addEventListener("storage", (e) => {
  if (e.key === "chatCustomCSS") {
    // Remove existing custom CSS
    const existingCustomCSS = document.querySelector(
      'style[data-custom-css="true"]',
    );
    if (existingCustomCSS) {
      existingCustomCSS.remove();
    }

    // Apply new custom CSS
    loadAndApplyCustomCSS();
  }
});
