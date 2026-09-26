document.addEventListener("DOMContentLoaded", () => {
  const body = document.querySelector("#task-body");
  const filter = document.querySelector("#task-filter");
  const projectFilter = document.querySelector("#project-filter");
  const modal = document.querySelector("#task-modal");
  const form = document.querySelector("#task-form");
  const pageTabs = document.querySelectorAll(".page-tabs a");
  const projectLabel = document.querySelector("#tasks-project-label");
  let editingTask = null;

  const projectSelect = form?.elements.projectId;
  const assigneeSelect = form?.elements.assignedTo;
  const state = { view: "all", projectId: "all" };

  const currentUserEmail = () => AppData.user?.email || "";

  const activeProjectId = () => {
    const requested = new URLSearchParams(location.search).get("projectId");
    if (requested && AppData.projects.some((project) => project.id === requested)) return requested;
    return AppData.projects[0]?.id || "";
  };

  const setActiveTab = () => {
    pageTabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.view === state.view));
    const projectName = state.projectId !== "all"
      ? AppData.projects.find((project) => project.id === state.projectId)?.name
      : "";
    if (projectLabel) {
      if (state.view === "mine") projectLabel.textContent = "My tasks";
      else if (projectName) projectLabel.textContent = `${projectName} tasks`;
      else projectLabel.textContent = "Project tasks";
    }
  };

  const fillProjectFilter = () => {
    if (!projectFilter) return;
    const selectedProjectExists = state.projectId !== "all" && AppData.projects.some((project) => project.id === state.projectId);
    state.projectId = selectedProjectExists ? state.projectId : "all";
    projectFilter.innerHTML = `<option value="all">All Projects</option>${AppData.projects.map((project) => `<option value="${escapeHtml(project.id)}">${escapeHtml(project.name)}</option>`).join("")}`;
    projectFilter.value = state.projectId;
  };

  const fillProjects = () => {
    if (!projectSelect) return;
    projectSelect.innerHTML = AppData.projects.map((project) => `<option value="${escapeHtml(project.id)}">${escapeHtml(project.name)}</option>`).join("");
    const defaultProject = activeProjectId();
    if (AppData.projects.some((project) => project.id === defaultProject)) projectSelect.value = defaultProject;
    else if (AppData.projects[0]) projectSelect.value = AppData.projects[0].id;
  };

  const fillAssignees = () => {
    if (!assigneeSelect || !projectSelect) return;
    const members = AppData.members.filter((member) => member.projectId === projectSelect.value);
    assigneeSelect.innerHTML = members.length
      ? members.map((member) => `<option value="${escapeHtml(member.email)}">${escapeHtml(member.email)}</option>`).join("")
      : '<option value="">No groupmates added yet</option>';
    if (editingTask) {
      assigneeSelect.value = editingTask.assignedTo || "";
    }
  };

  const getVisibleTasks = () => AppData.tasks.filter((task) => {
    const projectMatches = state.projectId === "all" || task.projectId === state.projectId;
    if (!projectMatches) return false;
    if (state.view === "mine") {
      if (!currentUserEmail()) return false;
      if (task.assignedTo !== currentUserEmail()) return false;
    }
    const selectedStatus = filter?.value || "All";
    return selectedStatus === "All" || task.status === selectedStatus;
  });

  const getProgressButtonLabel = (status) => {
    if (status === "To Do") return "Update progress";
    if (status === "In Progress") return "Mark as completed";
    return "Completed";
  };

  const taskRow = (task) => {
    const isMineTask = state.view === "mine" && task.assignedTo === currentUserEmail();
    const actionButtons = isMineTask
      ? `<button class="button button-ghost button-small update-task-progress" data-task-id="${escapeHtml(task.id)}" type="button">${getProgressButtonLabel(task.status)}</button>`
      : "";

    return `<tr><td class="task-title">${escapeHtml(task.title)}${task.description ? `<small>${escapeHtml(task.description)}</small>` : ""}</td><td>${escapeHtml(task.assignedTo || "Unassigned")}</td><td>${escapeHtml(formatDate(task.deadline))}</td><td><span class="badge ${statusClass(task.status)}">${escapeHtml(task.status)}</span></td><td class="task-actions">${actionButtons}<button class="button button-ghost button-small edit-task" data-task-id="${escapeHtml(task.id)}" type="button">Edit</button><button class="button button-ghost button-small delete-task" data-task-id="${escapeHtml(task.id)}" type="button">Delete</button></td></tr>`;
  };

  const draw = () => {
    if (!body) return;
    const projectIds = AppData.projects.filter((project) => state.projectId === "all" || project.id === state.projectId).map((project) => project.id);

    if (state.view === "mine" && !currentUserEmail()) {
      body.innerHTML = '<tr><td colspan="5"><p class="muted">No tasks assigned to you yet.</p></td></tr>';
      setActiveTab();
      return;
    }

    if (!projectIds.length) {
      body.innerHTML = state.view === "mine"
        ? '<tr><td colspan="5"><p class="muted">No tasks assigned to you yet.</p></td></tr>'
        : '<tr><td colspan="5"><p class="muted">No projects yet.</p></td></tr>';
      setActiveTab();
      return;
    }

    const visibleTasks = getVisibleTasks();
    const groupedHtml = AppData.projects
      .filter((project) => state.projectId === "all" || project.id === state.projectId)
      .map((project) => {
        const projectTasks = visibleTasks.filter((task) => task.projectId === project.id);
        const rows = [`<tr class="project-group-header"><td colspan="5"><strong>PROJECT: ${escapeHtml(project.name)}</strong></td></tr>`];
        if (projectTasks.length) {
          rows.push(projectTasks.map(taskRow).join(""));
        } else {
          rows.push(`<tr><td colspan="5"><p class="muted">${state.view === "mine" ? "No tasks assigned to you yet." : "No tasks yet for this project."}</p></td></tr>`);
        }
        return rows.join("");
      })
      .join("");

    body.innerHTML = groupedHtml || '<tr><td colspan="5"><p class="muted">No tasks assigned to you yet.</p></td></tr>';

    body.querySelectorAll(".edit-task").forEach((button) => button.addEventListener("click", () => openTask(button.dataset.taskId)));
    body.querySelectorAll(".delete-task").forEach((button) => button.addEventListener("click", () => {
      const task = AppData.tasks.find((item) => item.id === button.dataset.taskId);
      if (task && confirm(`Delete “${task.title}”?`)) {
        deleteTask(task.id);
        draw();
      }
    }));
    body.querySelectorAll(".update-task-progress").forEach((button) => button.addEventListener("click", () => {
      const task = AppData.tasks.find((item) => item.id === button.dataset.taskId);
      if (!task) return;
      if (task.assignedTo !== currentUserEmail()) return;
      const updatedTask = advanceTaskProgress(task.id);
      if (updatedTask) draw();
    }));

    setActiveTab();
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

  pageTabs.forEach((tab) => tab.addEventListener("click", (event) => {
    event.preventDefault();
    state.view = tab.dataset.view || "all";
    draw();
  }));

  fillProjectFilter();
  fillProjects();
  fillAssignees();
  draw();
  filter?.addEventListener("change", draw);
  projectFilter?.addEventListener("change", (event) => {
    state.projectId = event.target.value || "all";
    draw();
  });
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
    fillProjectFilter();
    draw();
  });
});
