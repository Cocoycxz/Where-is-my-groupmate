document.addEventListener("DOMContentLoaded", () => {
  const modal = document.querySelector("#nudge-modal");
  const open = document.querySelector("#nudge-button");
  const cancel = document.querySelector("#cancel-nudge");
  const send = document.querySelector("#send-nudge");
  const project = getCurrentProject();
  const member = AppData.members.find((item) => item.projectId === project?.id && item.status === "Away") || AppData.members.find((item) => item.projectId === project?.id);
  if (!member) {
    if (open) open.disabled = true;
    return;
  }
  if (open) open.textContent = `Nudge ${member.email}`;
  open?.addEventListener("click", () => modal.showModal());
  cancel?.addEventListener("click", () => modal.close());
  send?.addEventListener("click", () => {
    modal.close();
    open.textContent = "Nudged recently";
    open.disabled = true;
    open.classList.remove("button-primary");
    open.classList.add("button-ghost");
    addNotification(`You sent ${member.email} a friendly project reminder.`, "attention");
    addActivity({ projectId: member.projectId, memberEmail: member.email, action: "received a nudge", taskTitle: "project activity" });
    const note = document.querySelector("#nudge-result");
    if (note) note.textContent = "Nudge sent. Your groupmate will receive a local demo reminder.";
  });
});
