// Fetch built-in commands
async function fetchCommands() {
  const res = await fetch("/api/commands");
  const commands = await res.json();
  const tbody = document.getElementById("commands-table");
  const token = getParam("token");
  tbody.innerHTML = "";

  commands.forEach((cmd) => {
    const tr = document.createElement("tr");

    // Enabled toggle
    const enabledTd = document.createElement("td");
    const toggle = document.createElement("input");
    toggle.type = "checkbox";
    toggle.checked = !cmd.disabled;
    toggle.className = "toggle toggle-primary";
    toggle.addEventListener("change", () => {
      fetch(`/api/commands/${cmd.name}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disabled: !toggle.checked }),
      });
    });
    enabledTd.appendChild(toggle);
    tr.appendChild(enabledTd);

    // Name
    const nameTd = document.createElement("td");
    nameTd.textContent = cmd.name;
    tr.appendChild(nameTd);

    // Description
    const descTd = document.createElement("td");
    descTd.textContent = cmd.description;
    tr.appendChild(descTd);

    // Aliases
    const aliasTd = document.createElement("td");
    aliasTd.textContent = (cmd.alias || []).join(", ");
    tr.appendChild(aliasTd);

    // Args
    const argsTd = document.createElement("td");
    argsTd.innerHTML =
      (cmd.args || [])
        .map((a) => `${a.name}${a.required ? "" : "?"} — ${a.description}`)
        .join("<br>") || "—";
    tr.appendChild(argsTd);

    tbody.appendChild(tr);
  });
}

// Fetch custom commands
async function fetchCustomCommands() {
  try {
    const customCommands = await (await fetch("/api/custom-commands")).json();
    const { lang: currentLang } = await (await fetch("/api/lang")).json();
    const tbody = document.getElementById("custom-commands-table");
    tbody.innerHTML = "";

    customCommands.forEach((cmd) => {
      const tr = document.createElement("tr");

      const nameTd = document.createElement("td");
      nameTd.textContent = cmd.name[currentLang];
      tr.appendChild(nameTd);

      const descTd = document.createElement("td");
      descTd.textContent = cmd.description[currentLang];
      tr.appendChild(descTd);

      const aliasTd = document.createElement("td");
      aliasTd.textContent = (cmd.aliases[currentLang] || []).join(", ");
      tr.appendChild(aliasTd);

      const actionsTd = document.createElement("td");
      actionsTd.classList.add("flex", "gap-2");

      const editBtn = document.createElement("button");
      editBtn.className = "btn btn-sm btn-info";
      editBtn.innerHTML = `<i class="fas fa-edit"></i> Edit`;
      editBtn.onclick = () => openEditModal(cmd);
      actionsTd.appendChild(editBtn);

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "btn btn-sm btn-error";
      deleteBtn.innerHTML = `<i class="fas fa-trash"></i> Delete`;
      deleteBtn.onclick = () => handleDeleteCommand(cmd.name.en);
      actionsTd.appendChild(deleteBtn);

      tr.appendChild(actionsTd);
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Failed to fetch custom commands:", err);
  }
}

// Delete command
async function handleDeleteCommand(id) {
  if (!confirm("Are you sure you want to delete this command?")) return;
  try {
    const res = await fetch(`/api/custom-commands/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    await fetchCustomCommands();
  } catch (err) {
    console.error("Failed to delete command:", err);
  }
}

// Add/Edit Modal
document.getElementById("add-custom-btn").addEventListener("click", () => {
  openEditModal();
});

function openEditModal(cmd = null) {
  const form = document.getElementById("customCommandForm");
  form.reset();
  form.dataset.id = cmd ? cmd.name.en : "";
  if (cmd) {
    form["name_en"].value = cmd.name.en;
    form["name_th"].value = cmd.name.th || "";
    form["description_en"].value = cmd.description.en;
    form["description_th"].value = cmd.description.th || "";
    form["aliases_en"].value = (cmd.aliases?.en || []).join(", ");
    form["aliases_th"].value = (cmd.aliases?.th || []).join(", ");
    form["execute"].value = cmd.execute;
    form["modsOnly"].checked = !!cmd.modsOnly;
    form["broadcasterOnly"].checked = !!cmd.broadcasterOnly;
  }
  customCommandModal.showModal();
}

// Save handler
document
  .getElementById("customCommandForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const id = form.dataset.id;

    const payload = {
      name: {
        en: form["name_en"].value.trim(),
        th: form["name_th"].value.trim(),
      },
      description: {
        en: form["description_en"].value.trim(),
        th: form["description_th"].value.trim(),
      },
      aliases: {
        en: form["aliases_en"].value
          ? form["aliases_en"].value.split(",").map((a) => a.trim())
          : [],
        th: form["aliases_th"].value
          ? form["aliases_th"].value.split(",").map((a) => a.trim())
          : [],
      },
      args: [],
      execute: form["execute"].value.trim(),
      modsOnly: form["modsOnly"].checked,
      broadcasterOnly: form["broadcasterOnly"].checked,
    };

    try {
      const method = id ? "PUT" : "POST";
      const url = id ? `/api/custom-commands/${id}` : "/api/custom-commands";
      const res = await fetch(url, {
        method,
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      customCommandModal.close();
      await fetchCustomCommands();
    } catch (err) {
      console.error("Failed to save command:", err);
    }
  });

// Init
fetchCommands();
fetchCustomCommands();
