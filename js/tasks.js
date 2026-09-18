document.addEventListener("DOMContentLoaded", () => {
  const body = document.querySelector("#task-body");
  const filter = document.querySelector("#task-filter");
  const modal = document.querySelector("#task-modal");
  const form = document.querySelector("#task-form");
  let editingTask = null;

  const projectSelect = form?.elements.projectId;
  const assigneeSelect = form?.elements.assignedTo;
  const activeProjectId = () => new URLSearchParams(location.search).get("projectId") || AppData.projects[0]?.id;
  const projectLabel = document.querySelector("#tasks-project-label");
  const activeProject = AppData.projects.find((project) => project.id === activeProjectId());
  if (projectLabel && activeProject) projectLabel.textContent = activeProject.name;

  const fillProjects = () => {
    if (!projectSelect) return;
    projectSelect.innerHTML = AppData.projects.map((project) => `<option value="${escapeHtml(project.id)}">${escapeHtml(project.name)}</option>`).join("");
    if (activeProjectId()) projectSelect.value = activeProjectId();
  };

  const fillAssignees = () => {
    if (!assigneeSelect || !projectSelect) return;
    const members = AppData.members.filter((member) => member.projectId === projectSelect.value);
    assigneeSelect.innerHTML = members.length
      ? members.map((member) => `<option value="${escapeHtml(member.email)}">${escapeHtml(member.email)}</option>`).join("")
      : '<option value="">No groupmates added yet</option>';
  };

  const draw = () => {
    if (!body) return;
    const currentFilter = filter?.value || "All";
    const tasks = AppData.tasks.filter((task) => task.projectId === activeProjectId() && (currentFilter === "All" || task.status === currentFilter));
    body.innerHTML = tasks.length
      ? tasks.map((task) => `<tr><td class="task-title">${escapeHtml(task.title)}${task.description ? `<small>${escapeHtml(task.description)}</small>` : ""}</td><td>${escapeHtml(task.assignedTo || "Unassigned")}</td><td>${escapeHtml(formatDate(task.deadline))}</td><td><span class="badge ${statusClass(task.status)}">${escapeHtml(task.status)}</span></td><td class="task-actions"><button class="button button-ghost button-small edit-task" data-task-id="${escapeHtml(task.id)}" type="button">Edit</button><button class="button button-ghost button-small delete-task" data-task-id="${escapeHtml(task.id)}" type="button">Delete</button></td></tr>`).join("")
      : '<tr><td colspan="5"><p class="muted">No tasks yet.</p><p>Create a task to start organizing your project.</p></td></tr>';
    body.querySelectorAll(".edit-task").forEach((button) => button.addEventListener("click", () => openTask(button.dataset.taskId)));
    body.querySelectorAll(".delete-task").forEach((button) => button.addEventListener("click", () => {
      const task = AppData.tasks.find((item) => item.id === button.dataset.taskId);
      if (task && confirm(`Delete “${task.title}”?`)) {
        deleteTask(task.id);
        draw();
      }
    }));
  };

  const openTask = (taskId = "") => {
    editingTask = AppData.tasks.find((task) => task.id === taskId) || null;
    fillProjects();
    if (editingTask) {
      form.elements.title.value = editingTask.title;
      form.elements.description.value = editingTask.description || "";
      form.elements.projectId.value = editingTask.projectId;
      form.elements.deadline.value = editingTask.deadline || "";
      form.elements.status.value = editingTask.status;
    } else {
      form.reset();
      form.elements.projectId.value = activeProjectId() || "";
      form.elements.status.value = "To Do";
    }
    fillAssignees();
    if (editingTask) form.elements.assignedTo.value = editingTask.assignedTo || "";
    document.querySelector("#task-form-message").textContent = "";
    modal.showModal();
  };

  fillProjects();
  fillAssignees();
  draw();
  filter?.addEventListener("change", draw);
  projectSelect?.addEventListener("change", fillAssignees);
  document.querySelector("#add-task")?.addEventListener("click", () => openTask());
  document.querySelector("[data-close-modal]")?.addEventListener("click", () => modal.close());
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(form));
    const message = document.querySelector("#task-form-message");
    if (!values.title.trim() || !values.projectId || !values.deadline || !values.status) {
      message.textContent = "Please complete the task title, project, deadline, and status.";
      return;
    }
    if (!values.assignedTo) {
      message.textContent = "No groupmates added yet. Add a groupmate before assigning this task.";
      return;
    }
    if (new Date(`${values.deadline}T00:00:00`) < new Date(new Date().toDateString())) {
      message.textContent = "Please choose a future deadline.";
      return;
    }
    saveTask({ ...values, title: values.title.trim(), description: values.description.trim() }, editingTask);
    modal.close();
    form.reset();
    editingTask = null;
    fillProjects();
    fillAssignees();
    draw();
  });
});
