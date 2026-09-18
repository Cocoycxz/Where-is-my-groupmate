document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#profile-form");
  if (!form) return;
  form.elements.name.value = AppData.user.name || "";
  form.elements.email.value = AppData.user.email || "";
  form.elements.course.value = AppData.user.course || "";
  document.querySelector("#profile-name").textContent = AppData.user.name || "Current user";
  document.querySelector("#profile-email").textContent = AppData.user.email || "";
  document.querySelector("#profile-initials").textContent = AppData.user.initials || initialsFor(AppData.user.name || "User");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = form.elements.name.value.trim();
    const message = document.querySelector("#profile-message");
    if (!name) {
      message.textContent = "Please enter a display name.";
      return;
    }
    AppData.user.name = name;
    AppData.user.course = form.elements.course.value.trim();
    AppData.user.initials = initialsFor(name);
    writeStorage(storageKeys.currentUser, AppData.user);
    window.AppData = AppData;
    message.textContent = "Profile saved.";
  });
});
