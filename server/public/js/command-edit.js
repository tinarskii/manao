async function loadCommand() {
  const name = getParam('name');
  const res = await fetch(`/api/commands/${encodeURIComponent(name)}`);
  const cmd = await res.json();

  // Populate all fields...
  document.getElementById('name').value = cmd.name;
  document.getElementById('description').value = cmd.description;
  document.getElementById('aliases').value = (cmd.alias||[]).join(',');
  document.getElementById('modsOnly').checked = !!cmd.modsOnly;
  document.getElementById('broadcasterOnly').checked = !!cmd.broadcasterOnly;
  document.getElementById('disabled').checked = !!cmd.disabled;
}

document.getElementById('cmd-form').onsubmit = async e => {
  e.preventDefault();
  const name = getParam('name');
  const description = document.getElementById('description').value;
  const alias = document.getElementById('aliases').value.split(',').map(s=>s.trim()).filter(Boolean);
  const modsOnly = document.getElementById('modsOnly').checked;
  const broadcasterOnly = document.getElementById('broadcasterOnly').checked;
  const disabled = document.getElementById('disabled').checked;

  // send PUT
  await fetch(`/api/commands/${encodeURIComponent(name)}`, {
    method: 'PUT',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({
      description, alias, modsOnly, broadcasterOnly, disabled
    })
  });

  window.location.href = '/commands?token=' + getParam('token');
};

loadCommand()