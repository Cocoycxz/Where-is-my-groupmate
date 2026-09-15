document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".rating button").forEach((b) =>
    b.addEventListener("click", () => {
      b.parentElement
        .querySelectorAll("button")
        .forEach((x) => x.classList.remove("selected"));
      b.classList.add("selected");
    }),
  );
  document
    .querySelector("#evaluation-form")
    ?.addEventListener("submit", (e) => {
      e.preventDefault();
      document.querySelector("#evaluation-message").textContent =
        "Your peer evaluations have been saved.";
    });
});
