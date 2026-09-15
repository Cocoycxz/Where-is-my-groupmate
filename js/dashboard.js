document.addEventListener("DOMContentLoaded", () => {
  const stats = document.querySelector("#dashboard-stats"),
    activity = document.querySelector("#activity-list"),
    project = document.querySelector("#focus-project");
  if (stats)
    stats.innerHTML = `<article class="stat-card"><p>Active projects</p><b>${AppData.projects.length}</b><small>1 due this week</small></article><article class="stat-card"><p>Tasks completed</p><b>18 / 25</b><small>+4 this week</small></article><article class="stat-card"><p>Team contribution</p><b>75%</b><small>↑ 8% this week</small></article><article class="stat-card"><p>Unread updates</p><b>${AppData.notifications.length}</b><small>Review now</small></article>`;
  if (project) {
    let p = AppData.projects[0];
    project.innerHTML = `<div class="project-summary"><div class="panel-header"><h3>${p.name}</h3><span class="badge badge-success">${p.status}</span></div><p class="project-meta">${p.course} · Due ${p.due}</p><div class="progress"><i style="width:${p.progress}%"></i></div><p class="muted">${p.progress}% complete</p></div>`;
  }
  if (activity)
    activity.innerHTML = AppData.activities
      .map(
        (x) =>
          `<div class="list-item"><span class="dot"></span><p>${x.text}<br><small>${x.time}</small></p></div>`,
      )
      .join("");
});
