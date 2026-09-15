document.addEventListener("DOMContentLoaded", () => {
  const monitoring = document.querySelector("#monitoring-list");
  if (monitoring)
    monitoring.innerHTML = AppData.projects
      .map(
        (p) =>
          `<tr><td class="task-title">${p.name}</td><td>${p.course}</td><td><div class="progress"><i style="width:${p.progress}%"></i></div>${p.progress}%</td><td><span class="badge ${p.status === "On track" ? "badge-success" : "badge-warning"}">${p.status}</span></td></tr>`,
      )
      .join("");
  const performance = document.querySelector("#performance-list");
  if (performance)
    performance.innerHTML = AppData.members
      .map(
        (m) =>
          `<article class="contribution-card"><span class="avatar ${m.color}">${m.initials}</span><div><h3>${m.name}</h3><p>${m.role}</p><div class="progress"><i style="width:${m.score}%"></i></div></div><div class="contribution-score">${m.score}%</div></article>`,
      )
      .join("");
});
