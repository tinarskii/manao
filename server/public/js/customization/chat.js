class ChatOverlay {
  constructor({ previewId, formId, controlsPanelId }) {
    this.preview = document.getElementById(previewId);
    this.form = document.getElementById(formId);
    this.controlsPanel = document.getElementById(controlsPanelId);

    this.messageCount = 0;
    this.colors = [
      "#ff6b6b",
      "#4ecdc4",
      "#45b7d1",
      "#96ceb4",
      "#feca57",
      "#ff9ff3",
      "#54a0ff",
    ];
    this.roleBadges = {
      sub: "https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/1",
      vip: "https://static-cdn.jtvnw.net/badges/v1/b817aba4-fad8-49e2-b88a-7cc744dfa6ec/1",
      mod: "https://static-cdn.jtvnw.net/badges/v1/3267646d-33f0-4b17-b3df-f923a41db1d0/1",
      broadcaster:
        "https://static-cdn.jtvnw.net/badges/v1/5527c58c-fb7d-422d-b71b-f309dcb85cc1/1",
    };

    this.settings = {
      limit: 5,
      timeout: 10000,
      fontSize: 20,
      rounded: 16,
      textColor: "#ffffff",
      hideBadges: false,
      textShadow: true,
      boxShadow: true,
      animationIn: "slideInRight",
      animationOut: "slideOutLeft",
      backgroundOpacity: 0.85,
      messageDirection: "bottom",
      align: "left",
      roleBackgrounds: {
        normal: ["4e4e48", "38342b"],
        sub: ["8a8a0b", "b58923"],
        vip: ["320b4d", "6b136b"],
        mod: ["0c4d0b", "157426"],
        broadcaster: ["4d0b0b", "6b1320"],
      },
    };

    this.messages = [];
    this.attachEvents();
    this.renderInitialMessage();
  }

  attachEvents() {
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.addMessageFromForm();
    });

    const controls = this.controlsPanel.querySelectorAll("input, select");
    controls.forEach((control) => {
      control.addEventListener("input", () => this.onSettingsChange());
    });

    this.controlsPanel
      .querySelector("#copyBtn")
      .addEventListener("click", () => {
        const params = new URLSearchParams({
          fontSize: this.settings.fontSize,
          textColor: this.settings.textColor,
          backgroundOpacity: this.settings.backgroundOpacity,
          borderRadius: this.settings.rounded,
          boxShadow: this.settings.boxShadow,
          textShadow: this.settings.textShadow,
          hideBadges: this.settings.hideBadges,
          animationIn: this.settings.animationIn,
          animationOut: this.settings.animationOut,
          timeout: this.settings.timeout,
          limit: this.settings.limit,
          messageDirection: this.settings.messageDirection,
          align: this.settings.align,
          normalBg: this.settings.roleBackgrounds.normal.join(","),
          subBg: this.settings.roleBackgrounds.sub.join(","),
          vipBg: this.settings.roleBackgrounds.vip.join(","),
          modBg: this.settings.roleBackgrounds.mod.join(","),
          broadcasterBg: this.settings.roleBackgrounds.broadcaster.join(","),
        }).toString();
        const fullUrl = `http://localhost:3000/chat?${params}`;
        navigator.clipboard.writeText(fullUrl).then(() => {
          const output = this.controlsPanel.querySelector("#queryStringOutput");
          if (output) output.textContent = fullUrl;
        });
      });
  }

  onSettingsChange() {
    const p = this.controlsPanel;
    this.settings.textColor = p.querySelector("#textColor").value;
    this.settings.fontSize = parseInt(p.querySelector("#fontSize").value, 10);
    this.settings.backgroundOpacity = parseFloat(
      p.querySelector("#backgroundOpacity").value,
    );
    this.settings.rounded = parseInt(p.querySelector("#rounded").value, 10);
    this.settings.align = p.querySelector("#align").value;
    this.settings.boxShadow = p.querySelector("#boxShadow").checked;
    this.settings.textShadow = p.querySelector("#textShadow").checked;
    this.settings.hideBadges = p.querySelector("#hideBadges").checked;
    this.settings.messageDirection = p.querySelector("#messageDirection").value;

    this.settings.roleBackgrounds.normal = [
      p.querySelector("#normalBgStart").value.replace("#", ""),
      p.querySelector("#normalBgEnd").value.replace("#", ""),
    ];
    this.settings.roleBackgrounds.sub = [
      p.querySelector("#subBgStart").value.replace("#", ""),
      p.querySelector("#subBgEnd").value.replace("#", ""),
    ];
    this.settings.roleBackgrounds.vip = [
      p.querySelector("#vipBgStart").value.replace("#", ""),
      p.querySelector("#vipBgEnd").value.replace("#", ""),
    ];
    this.settings.roleBackgrounds.mod = [
      p.querySelector("#modBgStart").value.replace("#", ""),
      p.querySelector("#modBgEnd").value.replace("#", ""),
    ];
    this.settings.roleBackgrounds.broadcaster = [
      p.querySelector("#broadcasterBgStart").value.replace("#", ""),
      p.querySelector("#broadcasterBgEnd").value.replace("#", ""),
    ];

    this.settings.animationIn = p.querySelector("#animationIn").value;
    this.settings.animationOut = p.querySelector("#animationOut").value;
    this.settings.timeout = parseInt(p.querySelector("#timeout").value, 10);
    this.settings.limit = parseInt(p.querySelector("#limit").value, 10);

    const fontSizeDisplay = p.querySelector("#fontSizeDisplay");
    if (fontSizeDisplay)
      fontSizeDisplay.textContent = `${this.settings.fontSize}px`;
    const roundedDisplay = p.querySelector("#roundedDisplay");
    if (roundedDisplay)
      roundedDisplay.textContent = `${this.settings.rounded}px`;
    const bgDisplay = p.querySelector("#backgroundOpacityDisplay");
    if (bgDisplay)
      bgDisplay.textContent = this.settings.backgroundOpacity.toFixed(2);

    const dir =
      this.settings.messageDirection === "top"
        ? "flex-col"
        : "flex-col-reverse";
    this.preview.classList.remove("flex-col", "flex-col-reverse");
    this.preview.classList.add(dir);

    this.renderMessages();
  }

  renderInitialMessage() {
    this.addMessage({
      username: "ManaoBot",
      messageText: "🍋 Manao is ready!",
      role: "broadcaster",
    });
  }

  getRandomColor() {
    return this.colors[Math.floor(Math.random() * this.colors.length)];
  }

  getRoleStyle(role) {
    const bg =
      this.settings.roleBackgrounds[role] ||
      this.settings.roleBackgrounds.normal;
    const [startRaw, endRaw] = bg;
    const start = startRaw ? startRaw.trim() : "4e4e48";
    const end = endRaw ? endRaw.trim() : "38342b";
    const opacityHex = Math.round(this.settings.backgroundOpacity * 255)
      .toString(16)
      .padStart(2, "0");
    return {
      background: `linear-gradient(135deg, #${start}${opacityHex}, #${end}${opacityHex})`,
      borderLeftColor: `#${end}`,
    };
  }

  addMessageFromForm() {
    const username =
      this.form.querySelector("#newUsername").value.trim() || undefined;
    const messageText =
      this.form.querySelector("#newMessage").value.trim() || undefined;
    const role = this.form.querySelector("#userRole").value || "normal";
    this.addMessage({ username, messageText, role });
    this.form.querySelector("#newUsername").value = "";
    this.form.querySelector("#newMessage").value = "";
  }

  addMessage({ username, messageText, role } = {}) {
    if (!username) username = `User${++this.messageCount}`;
    if (!messageText) messageText = "Hello everyone! 👋";
    if (!role) role = "normal";
    this.messages.push({ username, messageText, role });
    if (this.messages.length > this.settings.limit) this.messages.shift();
    this.renderMessages();
  }

  renderMessages() {
    this.preview.innerHTML = "";
    const ordered =
      this.settings.messageDirection === "top"
        ? this.messages
        : [...this.messages].reverse();

    ordered.forEach(({ username, messageText, role }) => {
      const { background, borderLeftColor } = this.getRoleStyle(role);

      const container = document.createElement("div");
      container.className = `chatbox-container ${this.settings.animationIn}`;
      container.style.background = background;
      container.style.borderRadius = `${this.settings.rounded}px`;
      container.style.boxShadow = this.settings.boxShadow
        ? "0 2px 8px rgba(0,0,0,0.25)"
        : "none";
      container.setAttribute("data-role", role);
      container.style.textAlign = this.settings.align;

      if (this.settings.align === "center") {
        container.style.borderLeft = "none";
        container.style.borderRight = "none";
        container.style.borderBottom = `10px solid ${borderLeftColor}`;
      } else if (this.settings.align === "right") {
        container.style.borderLeft = "none";
        container.style.borderBottom = "none";
        container.style.borderRight = `10px solid ${borderLeftColor}`;
      } else {
        container.style.borderRight = "none";
        container.style.borderBottom = "none";
        container.style.borderLeft = `10px solid ${borderLeftColor}`;
      }

      const showBadge = !this.settings.hideBadges && role !== "normal";
      const badgeHTML =
        showBadge && this.roleBadges[role]
          ? `<img src="${this.roleBadges[role]}" alt="${role} badge" class="inline-block w-4 h-4 mr-1" />`
          : "";
      const badgeDiv = badgeHTML
        ? `<div class="badges">${badgeHTML}</div>`
        : "";

      container.innerHTML = `
        <div class="meta flex items-center mb-1">
          ${badgeDiv}
          <span class="username" style="color: ${this.getRandomColor()}; ${this.settings.textShadow ? "text-shadow: 0 2px 8px rgba(0,0,0,0.7);" : ""}">${username}</span>
        </div>
        <div class="message" style="color: ${this.settings.textColor}; font-size: ${this.settings.fontSize}px; ${this.settings.textShadow ? "text-shadow: 0 2px 8px rgba(0,0,0,0.7);" : ""}">${messageText}</div>
      `;
      container.classList.add(`align-${this.settings.align}`);
      this.preview.appendChild(container);
    });
  }
}

window.addEventListener("DOMContentLoaded", () => {
  new ChatOverlay({
    previewId: "chatPreview",
    formId: "addMessageForm",
    controlsPanelId: "controlsPanel",
  });
});
