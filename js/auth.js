document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = form.elements.email?.value.trim().toLowerCase();
    const name = form.elements.name?.value.trim() || email?.split("@")[0] || "Demo student";
    if (!email) return;
    AppData.user = { ...AppData.user, email, name, initials: initialsFor(name) };
    writeStorage(storageKeys.currentUser, AppData.user);
    window.AppData = AppData;
    const msg = document.querySelector("#auth-message");
    msg.textContent = "Success! Opening your student workspace...";
    setTimeout(() => (location.href = "student/dashboard.html"), 350);
  });
});
