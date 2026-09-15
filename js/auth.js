document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const msg = document.querySelector("#auth-message");
    msg.textContent = "Success! Opening your student workspace…";
    setTimeout(() => (location.href = "student/dashboard.html"), 650);
  });
});
