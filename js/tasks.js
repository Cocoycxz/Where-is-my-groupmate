document.addEventListener("DOMContentLoaded", () => {
  const body = document.querySelector("#task-body"),
    filter = document.querySelector("#task-filter"),
    modal = document.querySelector("#task-modal"),
    form = document.querySelector("#task-form");
  const draw = () => {
    if (!body) return;
    let tasks = AppData.tasks.filter(
      (t) => !filter || filter.value === "All" || t.status === filter.value,
    );
    body.innerHTML = tasks
      .map(
        (t) =>
          `<tr><td class="task-title">${t.title}</td><td>${t.assignee}</td><td>${t.due}</td><td><span class="badge ${t.status === "Done" ? "badge-success" : t.status === "Not started" ? "badge-neutral" : "badge-warning"}">${t.status}</span></td></tr>`,
      )
      .join("");
  };
  draw();
  filter?.addEventListener("change", draw);
  document
    .querySelector("#add-task")
    ?.addEventListener("click", () => modal.showModal());
  document
    .querySelector("[data-close-modal]")
    ?.addEventListener("click", () => modal.close());
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    AppData.tasks.push({
      title: form.title.value,
      assignee: form.assignee.value,
      due: "Sep 22",
      status: "Not started",
    });
    modal.close();
    form.reset();
    draw();
  });
});
