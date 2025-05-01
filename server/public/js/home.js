const sidebar = document.getElementById("sidebar");

function toggleSidebar() {
  sidebar.classList.toggle("visible");
}

const dropdowns = document.querySelectorAll(".dropdown");

dropdowns.forEach((dropdown) => {
  const toggle = dropdown.querySelector(".dropdown-toggle");
  if (!toggle) return; // Skip if no toggle is found
  toggle.addEventListener("click", () => {
    dropdown.classList.toggle("active");
  });
});

// Token-based redirection
const tokenInput = document.getElementById("token");
const tokenLinks = document.querySelectorAll(".token-link");

tokenLinks.forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    const token = tokenInput.value.trim();
    if (!token) {
      alert("Please enter a token first.");
      return;
    }
    const path = this.getAttribute("data-path");
    window.location.href = `/${path}?token=${encodeURIComponent(token)}`;
  });
});
