document.addEventListener("DOMContentLoaded", () => {
  const modal = document.querySelector("#nudge-modal"),
    open = document.querySelector("#nudge-button"),
    cancel = document.querySelector("#cancel-nudge"),
    send = document.querySelector("#send-nudge");
  open?.addEventListener("click", () => modal.showModal());
  cancel?.addEventListener("click", () => modal.close());
  send?.addEventListener("click", () => {
    modal.close();
    open.textContent = "Nudged recently";
    open.disabled = true;
    open.classList.remove("button-primary");
    open.classList.add("button-ghost");
    AppData.notifications.unshift({
      text: "You sent David a friendly nudge about “Analyze pilot data”.",
      time: "Just now",
    });
    const note = document.querySelector("#nudge-result");
    if (note)
      note.textContent =
        "Nudge sent. David will receive a reminder to check the project.";
  });
});
