const themeStorageKey = "wimg-theme";

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}

function updateThemeToggle(toggle, theme) {
  const isDark = theme === "dark";
  toggle.textContent = isDark ? "☀️" : "🌙";
  toggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  toggle.title = isDark ? "Switch to light mode" : "Switch to dark mode";
}

function addThemeToggle() {
  if (document.querySelector("[data-theme-toggle]")) return;

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "theme-toggle";
  toggle.dataset.themeToggle = "true";
  toggle.addEventListener("click", () => {
    const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    localStorage.setItem(themeStorageKey, nextTheme);
    updateThemeToggle(toggle, nextTheme);
  });

  const target = document.querySelector(".site-header nav, .topbar-actions, .topbar, .auth-page");
  if (!target) return;
  target.append(toggle);
  updateThemeToggle(toggle, document.documentElement.dataset.theme || "light");
}

applyTheme(localStorage.getItem(themeStorageKey) || "light");

document.addEventListener("DOMContentLoaded", () => {
  addThemeToggle();

  const path = location.pathname.split("/").pop();
  document.querySelectorAll(".sidebar nav a").forEach((a) => {
    if (a.getAttribute("href") === path) a.classList.add("active");
  });
  const name = document.querySelector("[data-user-name]");
  if (name && window.AppData) name.textContent = AppData.user.name;
});
