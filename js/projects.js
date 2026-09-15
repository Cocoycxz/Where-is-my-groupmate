document.addEventListener("DOMContentLoaded", () => {
  const list = document.querySelector("#project-list"),
    details = document.querySelector("#project-details");
  if (list)
    list.innerHTML = AppData.projects
      .map(
        (p) =>
          `<article class="project-card"><span class="badge ${p.status === "On track" ? "badge-success" : "badge-warning"}">${p.status}</span><h2>${p.name}</h2><p>${p.course} · Due ${p.due}</p><div class="progress"><i style="width:${p.progress}%"></i></div><p class="muted">${p.progress}% complete</p><div class="project-card-footer"><div class="member-row"><span class="avatar violet">AR</span><span class="avatar blue">JS</span><span class="avatar orange">MC</span></div><a class="button button-ghost button-small" href="project-details.html">View project</a></div></article>`,
      )
      .join("");
  if (details) {
    let p = AppData.projects[0];
    details.innerHTML = `<section class="detail-hero"><p>${p.course}</p><h2>${p.name}</h2><p>${p.description}</p></section><div class="detail-grid"><section class="panel"><div class="panel-header"><h2>Project progress</h2><span>${p.progress}%</span></div><div class="progress"><i style="width:${p.progress}%"></i></div><p class="muted">Milestone 3 of 4 · Due ${p.due}</p><h2 class="section-title">Recent activity</h2><div id="activity-list"></div></section><aside class="panel"><div class="panel-header"><h2>Team</h2><a href="contributions.html">Insights</a></div>${AppData.members.map((m) => `<div class="team-member"><div class="person"><span class="avatar ${m.color}">${m.initials}</span><div><p>${m.name}</p><small>${m.role}</small></div></div><span class="badge ${m.inactive ? "badge-warning" : "badge-success"}">${m.inactive ? "Quiet" : "Active"}</span></div>`).join("")}</aside></div>`;
    let activity = document.querySelector("#activity-list");
    activity.innerHTML = AppData.activities
      .map(
        (x) =>
          `<div class="list-item"><span class="dot"></span><p>${x.text}<br><small>${x.time}</small></p></div>`,
      )
      .join("");
  }
});
