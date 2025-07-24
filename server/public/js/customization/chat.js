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

    this.defaultSettings = {
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

    this.builtInThemes = {
      Default: { ...this.defaultSettings },
      Neon: {
        ...this.defaultSettings,
        fontSize: 22,
        rounded: 8,
        textColor: "#00ffff",
        animationIn: "slideInLeft",
        animationOut: "slideOutRight",
        backgroundOpacity: 0.9,
        roleBackgrounds: {
          normal: ["0a0a23", "1a1a3a"],
          sub: ["ff00ff", "8b008b"],
          vip: ["00ff41", "00cc33"],
          mod: ["ff6600", "cc4400"],
          broadcaster: ["ff0080", "cc0066"],
        },
      },
      Deep: {
        ...this.defaultSettings,
        rounded: 20,
        textColor: "#e6f3ff",
        animationIn: "fadeInUp",
        animationOut: "fadeOutDown",
        backgroundOpacity: 0.8,
        roleBackgrounds: {
          normal: ["1e3a5f", "2c5282"],
          sub: ["3182ce", "4299e1"],
          vip: ["065f46", "047857"],
          mod: ["7c2d12", "9a3412"],
          broadcaster: ["5b21b6", "7c3aed"],
        },
      },
      Sunset: {
        ...this.defaultSettings,
        fontSize: 21,
        rounded: 12,
        textColor: "#fef7cd",
        animationIn: "bounceInRight",
        animationOut: "bounceOutLeft",
        backgroundOpacity: 0.75,
        roleBackgrounds: {
          normal: ["7c2d12", "dc2626"],
          sub: ["ea580c", "f97316"],
          vip: ["ca8a04", "eab308"],
          mod: ["9333ea", "c084fc"],
          broadcaster: ["dc2626", "f87171"],
        },
      },
    };

    this.settings = { ...this.defaultSettings };
    this.currentTheme = "Default";
    this.customThemes = this.loadCustomThemes();
    this.messages = [];

    this.initializeThemeSystem();
    this.attachEvents();
    this.renderInitialMessage();
  }

  initializeThemeSystem() {
    this.populateThemeDropdown();
    this.createThemeButtons();
    this.updateUIFromSettings();
  }

  populateThemeDropdown() {
    const themeSelect = this.controlsPanel.querySelector("#theme");
    if (!themeSelect) return;

    themeSelect.innerHTML = "";

    Object.keys(this.builtInThemes).forEach((themeName) => {
      const option = document.createElement("option");
      option.value = themeName;
      option.textContent = themeName;
      themeSelect.appendChild(option);
    });

    if (Object.keys(this.customThemes).length > 0) {
      const separator = document.createElement("option");
      separator.disabled = true;
      separator.textContent = "── Custom Themes ──";
      themeSelect.appendChild(separator);

      Object.keys(this.customThemes).forEach((themeName) => {
        const option = document.createElement("option");
        option.value = themeName;
        option.textContent = themeName;
        themeSelect.appendChild(option);
      });
    }

    themeSelect.value = this.currentTheme;
  }

  createThemeButtons() {
    const themeSelect = this.controlsPanel.querySelector("#theme");
    if (!themeSelect) return;

    const existingButtons = this.controlsPanel.querySelectorAll(".theme-btn");
    existingButtons.forEach((btn) => btn.remove());

    const buttonContainer = document.createElement("div");
    buttonContainer.className = "theme-buttons";
    buttonContainer.style.cssText =
      "margin-top: 8px; display: flex; gap: 8px; flex-wrap: wrap;";

    const saveBtn = this.createButton("Save Theme", "save-theme-btn btn btn-success", () =>
      this.showSaveThemeDialog(),
    );
    const deleteBtn = this.createButton(
      "Delete Theme",
      "delete-theme-btn btn btn-error",
      () => this.showDeleteThemeDialog(),
    );
    const resetBtn = this.createButton(
      "Reset to Default",
      "reset-theme-btn btn btn-secondary",
      () => this.resetToDefault(),
    );

    buttonContainer.appendChild(saveBtn);
    buttonContainer.appendChild(deleteBtn);
    buttonContainer.appendChild(resetBtn);

    themeSelect.parentNode.appendChild(buttonContainer);
  }

  createButton(text, className, onClick) {
    const button = document.createElement("button");
    button.textContent = text;
    button.className = `theme-btn ${className}`;
    button.type = "button";
    button.addEventListener("click", onClick);
    return button;
  }

  showSaveThemeDialog() {
    const themeName = prompt("Enter a name for this theme:");
    if (!themeName) return;

    if (!this.isValidThemeName(themeName)) {
      alert(
        "Invalid theme name. Please use only letters, numbers, spaces, and basic punctuation.",
      );
      return;
    }

    if (this.builtInThemes[themeName]) {
      alert(
        "Cannot overwrite built-in themes. Please choose a different name.",
      );
      return;
    }

    if (this.customThemes[themeName]) {
      if (
        !confirm(
          `Theme "${themeName}" already exists. Do you want to overwrite it?`,
        )
      ) {
        return;
      }
    }

    this.saveCustomTheme(themeName);
    this.showNotification(`Theme "${themeName}" saved successfully!`);
  }

  showDeleteThemeDialog() {
    const customThemeNames = Object.keys(this.customThemes);
    if (customThemeNames.length === 0) {
      alert("No custom themes to delete.");
      return;
    }

    const themeName = prompt(
      `Enter the name of the theme to delete:\n\nAvailable custom themes:\n${customThemeNames.join(", ")}`,
    );
    if (!themeName) return;

    if (!this.customThemes[themeName]) {
      alert(`Custom theme "${themeName}" not found.`);
      return;
    }

    if (confirm(`Are you sure you want to delete the theme "${themeName}"?`)) {
      this.deleteCustomTheme(themeName);
      this.showNotification(`Theme "${themeName}" deleted successfully!`);
    }
  }

  resetToDefault() {
    if (confirm("Reset all settings to default values?")) {
      this.loadTheme("Default");
      this.showNotification("Settings reset to default!");
    }
  }

  isValidThemeName(name) {
    return /^[a-zA-Z0-9\s\-_().]{1,50}$/.test(name.trim());
  }

  showNotification(message) {
    const notification = document.createElement("div");
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      z-index: 10000;
      font-size: 14px;
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = "0";
      notification.style.transition = "opacity 0.3s";
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
  }

  loadCustomThemes() {
    try {
      return JSON.parse(localStorage.getItem("chatCustomThemes") || "{}");
    } catch (error) {
      console.error("Error loading custom themes:", error);
      return {};
    }
  }

  saveCustomThemes() {
    try {
      localStorage.setItem(
        "chatCustomThemes",
        JSON.stringify(this.customThemes),
      );
    } catch (error) {
      console.error("Error saving custom themes:", error);
      alert("Failed to save theme. Storage might be full.");
    }
  }

  saveCustomTheme(name) {
    const themeData = this.getCurrentSettingsAsTheme();
    this.customThemes[name] = themeData;
    this.saveCustomThemes();
    this.currentTheme = name;
    this.populateThemeDropdown();
  }

  deleteCustomTheme(name) {
    delete this.customThemes[name];
    this.saveCustomThemes();

    if (this.currentTheme === name) {
      this.loadTheme("Default");
    }

    this.populateThemeDropdown();
  }

  getCurrentSettingsAsTheme() {
    return {
      limit: this.settings.limit,
      timeout: this.settings.timeout,
      fontSize: this.settings.fontSize,
      rounded: this.settings.rounded,
      textColor: this.settings.textColor,
      hideBadges: this.settings.hideBadges,
      textShadow: this.settings.textShadow,
      boxShadow: this.settings.boxShadow,
      animationIn: this.settings.animationIn,
      animationOut: this.settings.animationOut,
      backgroundOpacity: this.settings.backgroundOpacity,
      messageDirection: this.settings.messageDirection,
      align: this.settings.align,
      roleBackgrounds: JSON.parse(
        JSON.stringify(this.settings.roleBackgrounds),
      ),
    };
  }

  loadTheme(themeName) {
    let themeData;

    if (this.builtInThemes[themeName]) {
      themeData = this.builtInThemes[themeName];
    } else if (this.customThemes[themeName]) {
      themeData = this.customThemes[themeName];
    } else {
      console.warn(`Theme "${themeName}" not found, loading default`);
      themeData = this.builtInThemes.Default;
      themeName = "Default";
    }

    this.settings = JSON.parse(JSON.stringify(themeData));
    this.currentTheme = themeName;

    this.updateUIFromSettings();

    const themeSelect = this.controlsPanel.querySelector("#theme");
    if (themeSelect) {
      themeSelect.value = themeName;
    }

    this.renderMessages();
  }

  updateUIFromSettings() {
    const p = this.controlsPanel;

    const updates = [
      ["#textColor", this.settings.textColor],
      ["#fontSize", this.settings.fontSize],
      ["#backgroundOpacity", this.settings.backgroundOpacity],
      ["#rounded", this.settings.rounded],
      ["#align", this.settings.align],
      ["#boxShadow", this.settings.boxShadow],
      ["#textShadow", this.settings.textShadow],
      ["#hideBadges", this.settings.hideBadges],
      ["#messageDirection", this.settings.messageDirection],
      ["#animationIn", this.settings.animationIn],
      ["#animationOut", this.settings.animationOut],
      ["#timeout", this.settings.timeout],
      ["#limit", this.settings.limit],
      ["#normalBgStart", "#" + this.settings.roleBackgrounds.normal[0]],
      ["#normalBgEnd", "#" + this.settings.roleBackgrounds.normal[1]],
      ["#subBgStart", "#" + this.settings.roleBackgrounds.sub[0]],
      ["#subBgEnd", "#" + this.settings.roleBackgrounds.sub[1]],
      ["#vipBgStart", "#" + this.settings.roleBackgrounds.vip[0]],
      ["#vipBgEnd", "#" + this.settings.roleBackgrounds.vip[1]],
      ["#modBgStart", "#" + this.settings.roleBackgrounds.mod[0]],
      ["#modBgEnd", "#" + this.settings.roleBackgrounds.mod[1]],
      [
        "#broadcasterBgStart",
        "#" + this.settings.roleBackgrounds.broadcaster[0],
      ],
      ["#broadcasterBgEnd", "#" + this.settings.roleBackgrounds.broadcaster[1]],
    ];

    updates.forEach(([selector, value]) => {
      const element = p.querySelector(selector);
      if (element) {
        if (element.type === "checkbox") {
          element.checked = value;
        } else {
          element.value = value;
        }
      }
    });

    this.updateDisplayElements();
  }

  updateDisplayElements() {
    const p = this.controlsPanel;

    const fontSizeDisplay = p.querySelector("#fontSizeDisplay");
    if (fontSizeDisplay)
      fontSizeDisplay.textContent = `${this.settings.fontSize}px`;

    const roundedDisplay = p.querySelector("#roundedDisplay");
    if (roundedDisplay)
      roundedDisplay.textContent = `${this.settings.rounded}px`;

    const bgDisplay = p.querySelector("#backgroundOpacityDisplay");
    if (bgDisplay)
      bgDisplay.textContent = this.settings.backgroundOpacity.toFixed(2);
  }

  attachEvents() {
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.addMessageFromForm();
    });

    const themeSelect = this.controlsPanel.querySelector("#theme");
    if (themeSelect) {
      themeSelect.addEventListener("change", (e) => {
        this.loadTheme(e.target.value);
      });
    }

    const controls = this.controlsPanel.querySelectorAll("input, select");
    controls.forEach((control) => {
      if (
        control.id === "addBtn" ||
        control.id === "copyBtn" ||
        control.id === "theme"
      )
        return;

      control.addEventListener("change", () => {
        this.onSettingsChange();
      });
    });

    this.controlsPanel
      .querySelector("#copyBtn")
      ?.addEventListener("click", () => {
        this.copySettingsAsURL();
      });
  }

  onSettingsChange() {
    const p = this.controlsPanel;

    this.settings.textColor =
      p.querySelector("#textColor")?.value || this.settings.textColor;
    this.settings.fontSize =
      parseInt(p.querySelector("#fontSize")?.value, 10) ||
      this.settings.fontSize;
    this.settings.backgroundOpacity =
      parseFloat(p.querySelector("#backgroundOpacity")?.value) ||
      this.settings.backgroundOpacity;
    this.settings.rounded =
      parseInt(p.querySelector("#rounded")?.value, 10) || this.settings.rounded;
    this.settings.align =
      p.querySelector("#align")?.value || this.settings.align;
    this.settings.boxShadow =
      p.querySelector("#boxShadow")?.checked ?? this.settings.boxShadow;
    this.settings.textShadow =
      p.querySelector("#textShadow")?.checked ?? this.settings.textShadow;
    this.settings.hideBadges =
      p.querySelector("#hideBadges")?.checked ?? this.settings.hideBadges;
    this.settings.messageDirection =
      p.querySelector("#messageDirection")?.value ||
      this.settings.messageDirection;
    this.settings.animationIn =
      p.querySelector("#animationIn")?.value || this.settings.animationIn;
    this.settings.animationOut =
      p.querySelector("#animationOut")?.value || this.settings.animationOut;
    this.settings.timeout =
      parseInt(p.querySelector("#timeout")?.value, 10) || this.settings.timeout;
    this.settings.limit =
      parseInt(p.querySelector("#limit")?.value, 10) || this.settings.limit;

    const roleUpdates = [
      ["normal", "#normalBgStart", "#normalBgEnd"],
      ["sub", "#subBgStart", "#subBgEnd"],
      ["vip", "#vipBgStart", "#vipBgEnd"],
      ["mod", "#modBgStart", "#modBgEnd"],
      ["broadcaster", "#broadcasterBgStart", "#broadcasterBgEnd"],
    ];

    roleUpdates.forEach(([role, startSelector, endSelector]) => {
      const startEl = p.querySelector(startSelector);
      const endEl = p.querySelector(endSelector);
      if (startEl && endEl) {
        this.settings.roleBackgrounds[role] = [
          startEl.value.replace("#", ""),
          endEl.value.replace("#", ""),
        ];
      }
    });

    if (
      this.currentTheme &&
      (this.builtInThemes[this.currentTheme] ||
        this.customThemes[this.currentTheme])
    ) {
      this.currentTheme = null;
      const themeSelect = p.querySelector("#theme");
      if (themeSelect) {
        themeSelect.value = "";
      }
    }

    this.updateDisplayElements();
    this.renderMessages();
  }

  copySettingsAsURL() {
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

    const fullUrl = `${window.location.origin}/chat?${params}`;

    navigator.clipboard
      .writeText(fullUrl)
      .then(() => {
        const output = this.controlsPanel.querySelector("#queryStringOutput");
        if (output) output.textContent = fullUrl;
        this.showNotification("URL copied to clipboard!");
      })
      .catch(() => {
        alert("Failed to copy URL to clipboard");
      });
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
      this.form.querySelector("#newUsername")?.value.trim() || undefined;
    const messageText =
      this.form.querySelector("#newMessage")?.value.trim() || undefined;
    const role = this.form.querySelector("#userRole")?.value || "normal";

    this.addMessage({ username, messageText, role });

    const usernameField = this.form.querySelector("#newUsername");
    const messageField = this.form.querySelector("#newMessage");
    if (usernameField) usernameField.value = "";
    if (messageField) messageField.value = "";
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

    const animateIndex =
      this.settings.messageDirection === "top" ? ordered.length - 1 : 0;

    const dir =
      this.settings.messageDirection === "top"
        ? "flex-col"
        : "flex-col-reverse";
    this.preview.classList.remove("flex-col", "flex-col-reverse");
    this.preview.classList.add(dir);

    ordered.forEach(({ username, messageText, role }, index) => {
      const { background, borderLeftColor } = this.getRoleStyle(role);

      const container = document.createElement("div");
      container.className = "chatbox-container";
      if (index === animateIndex) {
        container.classList.add(this.settings.animationIn);
      }
      container.style.background = background;
      container.style.borderRadius = `${this.settings.rounded}px`;
      container.style.boxShadow = this.settings.boxShadow
        ? "0 2px 8px rgba(0,0,0,0.25)"
        : "none";
      container.style.textShadow = this.settings.textShadow
        ? "0 2px 8px rgba(0,0,0,0.7)"
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
