document.addEventListener("DOMContentLoaded", () => {
  const list = document.querySelector("#project-list");
  const details = document.querySelector("#project-details");
  const formPanel = document.querySelector("#project-form-panel");
  const projectForm = document.querySelector("#project-form");
  const search = document.querySelector(".filter-bar input");

  const renderProjects = () => {
    if (!list) return;
    const query = search?.value.trim().toLowerCase() || "";
    const projects = AppData.projects.filter((project) => `${project.name} ${project.description}`.toLowerCase().includes(query));
    list.innerHTML = projects.length ? projects.map((project) => {
      const progress = projectProgress(project.id);
      const members = AppData.members.filter((member) => member.projectId === project.id).slice(0, 3);
      return `<article class="project-card"><span class="badge ${statusClass(project.status)}">${escapeHtml(project.status)}</span><h2>${escapeHtml(project.name)}</h2><p>${escapeHtml(project.course || "Student workspace")} · Due ${escapeHtml(formatDate(project.deadline))}</p><div class="progress"><i style="width:${progress}%"></i></div><p class="muted">${progress}% complete</p><div class="project-card-footer"><div class="member-row">${members.map((member) => `<span class="avatar ${escapeHtml(member.color)}" title="${escapeHtml(member.email)}">${escapeHtml(member.initials)}</span>`).join("") || '<span class="muted">No groupmates yet</span>'}</div><a class="button button-ghost button-small" href="project-details.html?projectId=${encodeURIComponent(project.id)}">View project</a></div></article>`;
    }).join("") : '<div class="panel"><p class="muted">No projects yet.</p><p>Create your first group project to get started.</p></div>';
  };

  if (list) {
    renderProjects();
    const projectCount = document.querySelector("#project-count");
    if (projectCount) projectCount.textContent = `${AppData.projects.filter((project) => project.status !== "Completed").length} active projects`;
    search?.addEventListener("input", renderProjects);
    return;
  }

  const project = getCurrentProject();
  const isNew = new URLSearchParams(location.search).get("create") === "1" || !project;
  if (isNew) {
    if (formPanel) formPanel.hidden = false;
    if (details) details.hidden = true;
    projectForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      const message = document.querySelector("#project-form-message");
      const values = Object.fromEntries(new FormData(projectForm));
      if (!values.name.trim() || !values.deadline || !values.status) {
        message.textContent = "Please complete the project name, deadline, and status.";
        return;
      }
      if (new Date(`${values.deadline}T00:00:00`) < new Date(new Date().toDateString())) {
        message.textContent = "Please choose a future deadline.";
        return;
      }
      const created = createProject(values);
      location.href = `project-details.html?projectId=${encodeURIComponent(created.id)}`;
    });
    return;
  }

  if (formPanel) formPanel.hidden = true;
  const tasksLink = document.querySelector(".topbar-actions a[href='tasks.html']");
  if (tasksLink) tasksLink.href = `tasks.html?projectId=${encodeURIComponent(project.id)}`;
  renderDetails(project, details);
});

function renderDetails(project, details) {
  if (!details) return;
  const progress = projectProgress(project.id);
  const members = AppData.members.filter((member) => member.projectId === project.id);
  const activities = AppData.activities.filter((activity) => activity.projectId === project.id).slice(0, 5);
  details.innerHTML = `<section class="detail-hero"><p>${escapeHtml(project.course || "Student workspace")}</p><h2>${escapeHtml(project.name)}</h2><p>${escapeHtml(project.description)}</p></section><div class="detail-grid"><section class="panel"><div class="panel-header"><h2>Project progress</h2><span>${progress}%</span></div><div class="progress"><i style="width:${progress}%"></i></div><p class="muted">${progress}% complete · Due ${escapeHtml(formatDate(project.deadline))}</p><form id="project-edit-form" class="form-stack"><label>Project name<input name="name" value="${escapeHtml(project.name)}" required /></label><label>Description<textarea name="description" rows="3">${escapeHtml(project.description)}</textarea></label><label>Deadline<input name="deadline" type="date" value="${escapeHtml(project.deadline)}" required /></label><label>Status<select name="status"><option ${project.status === "Planning" ? "selected" : ""}>Planning</option><option ${project.status === "In Progress" ? "selected" : ""}>In Progress</option><option ${project.status === "On Hold" ? "selected" : ""}>On Hold</option></select></label><p id="project-edit-message" class="form-message"></p><button class="button button-ghost" type="submit">Save changes</button></form><button id="delete-project" class="button button-ghost" type="button">Delete project</button><h2 class="section-title">Recent activity</h2><div id="activity-list">${activities.map((activity) => `<div class="list-item"><span class="dot"></span><p>${activityText(activity)}<br><small>${timeAgo(activity.timestamp)}</small></p></div>`).join("") || '<p class="muted">No activity yet.</p>'}</div></section><aside class="panel"><div class="panel-header"><h2>Groupmates</h2><a href="contributions.html?projectId=${encodeURIComponent(project.id)}">Insights</a></div><form id="member-form" class="form-stack"><label>Email address<input name="email" type="email" placeholder="groupmate@gmail.com" required /></label><p id="member-message" class="form-message"></p><button class="button button-primary" type="submit">Add groupmate</button></form><div id="member-list">${members.length ? members.map((member) => `<div class="team-member"><div class="person"><span class="avatar ${escapeHtml(member.color)}">${escapeHtml(member.initials)}</span><div><p>${escapeHtml(member.email)}</p><small>${escapeHtml(member.status)}</small></div></div><button class="button button-ghost button-small remove-member" data-member-id="${escapeHtml(member.id)}" type="button">Remove</button></div>`).join("") : '<p class="muted">No groupmates yet. Add a Gmail address to add a member.</p>'}</div></aside></div>`;

  document.querySelector("#project-edit-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    if (!values.name.trim() || !values.deadline) {
      document.querySelector("#project-edit-message").textContent = "Please complete the project fields.";
      return;
    }
    Object.assign(project, { name: values.name.trim(), description: values.description.trim(), deadline: values.deadline, status: values.status });
    saveAll();
    addActivity({ projectId: project.id, action: "updated", taskTitle: project.name });
    renderDetails(project, details);
  });

  document.querySelector("#delete-project")?.addEventListener("click", () => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    deleteProject(project.id);
    location.href = "projects.html";
  });

  document.querySelector("#member-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const result = addMember(project.id, form.email.value);
    const message = document.querySelector("#member-message");
    if (result.error) {
      message.textContent = result.error;
      return;
    }
    renderDetails(project, details);
  });

  document.querySelectorAll(".remove-member").forEach((button) => button.addEventListener("click", () => {
    if (confirm("Remove this groupmate from the project?")) {
      removeMember(button.dataset.memberId);
      renderDetails(project, details);
    }
  }));
}
