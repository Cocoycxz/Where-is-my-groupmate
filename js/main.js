document.addEventListener("DOMContentLoaded", () => {
  const path = location.pathname.split("/").pop();
  document.querySelectorAll(".sidebar nav a").forEach((a) => {
    if (a.getAttribute("href") === path) a.classList.add("active");
  });
  const name = document.querySelector("[data-user-name]");
  if (name) name.textContent = AppData.user.name;
});
