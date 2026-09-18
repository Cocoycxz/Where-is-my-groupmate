document.addEventListener("DOMContentLoaded", () => {
  const stats = document.querySelector("#dashboard-stats");
  const activity = document.querySelector("#activity-list");
  const project = document.querySelector("#focus-project");
  const upcoming = document.querySelector("#upcoming-tasks");
  const notificationCount = document.querySelector("#notification-count");
  const activeProjects = AppData.projects.filter((item) => item.status !== "Completed").length;
  const completedTasks = AppData.tasks.filter((task) => task.status === "Completed").length;
  const contribution = AppData.members.length
    ? Math.round(AppData.members.reduce((total, member) => total + Number(member.score || 0), 0) / AppData.members.length)
    : 0;

  if (stats) {
    stats.innerHTML = `<article class="stat-card"><p>Active projects</p><b>${activeProjects}</b><small>${AppData.projects.length} total</small></article><article class="stat-card"><p>Tasks completed</p><b>${completedTasks} / ${AppData.tasks.length}</b><small>${AppData.tasks.length ? Math.round((completedTasks / AppData.tasks.length) * 100) : 0}% complete</small></article><article class="stat-card"><p>Team contribution</p><b>${contribution}%</b><small>${AppData.members.length} groupmates</small></article><article class="stat-card"><p>Unread updates</p><b>${AppData.notifications.length}</b><small>Review now</small></article>`;
  }
  if (notificationCount) notificationCount.textContent = AppData.notifications.length;

  const focus = AppData.projects[0];
  if (project && focus) {
    const progress = projectProgress(focus.id);
    project.innerHTML = `<div class="project-summary"><div class="panel-header"><h3>${escapeHtml(focus.name)}</h3><span class="badge ${statusClass(focus.status)}">${escapeHtml(focus.status)}</span></div><p class="project-meta">${escapeHtml(focus.course || "Student workspace")} · Due ${escapeHtml(formatDate(focus.deadline))}</p><div class="progress"><i style="width:${progress}%"></i></div><p class="muted">${progress}% complete</p></div>`;
  } else if (project) {
    project.innerHTML = '<p class="muted">No projects yet. Create your first group project to get started.</p>';
  }

  if (upcoming) {
    const tasks = AppData.tasks.filter((task) => task.status !== "Completed").slice(0, 4);
    upcoming.innerHTML = tasks.length
      ? tasks.map((task) => `<div class="list-item"><span class="dot"></span><p>${escapeHtml(task.title)}<br><small>${escapeHtml(task.assignedTo || "Unassigned")} · Due ${escapeHtml(formatDate(task.deadline))}</small></p></div>`).join("")
      : '<p class="muted">No tasks yet. Create a task to start organizing your project.</p>';
  }

  if (activity) {
    activity.innerHTML = AppData.activities.slice(0, 5).map((item) => `<div class="list-item"><span class="dot"></span><p>${activityText(item)}<br><small>${timeAgo(item.timestamp)}</small></p></div>`).join("") || '<p class="muted">No activity yet.</p>';
  }
});
