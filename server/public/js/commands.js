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

    // Actions (Edit + Delete)
    const actionsTd = document.createElement("td");
    actionsTd.className = "space-x-2";

    // Edit button
    const editBtn = document.createElement("a");
    editBtn.href = `/command-edit?token=${token}&name=${encodeURIComponent(cmd.name)}`;
    editBtn.className = "btn btn-sm btn-success";
    editBtn.textContent = "Edit";

    // Delete button
    const delBtn = document.createElement("button");
    delBtn.className = "btn btn-sm btn-error";
    delBtn.textContent = "Delete";
    delBtn.onclick = async () => {
      if (!confirm(`Delete command "${cmd.name}"?`)) return;
      const resp = await fetch(`/api/commands/${cmd.name}`, {
        method: "DELETE",
      });
      if (resp.ok) tr.remove();
    };

    actionsTd.append(editBtn, delBtn);
    tr.append(actionsTd);

    tbody.appendChild(tr);
  });
}

fetchCommands();
