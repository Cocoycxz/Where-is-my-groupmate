document.addEventListener("DOMContentLoaded", () => {
  const list = document.querySelector("#contribution-list");
  const project = getCurrentProject();
  const projectName = document.querySelector("#contribution-project-name");
  if (projectName && project) projectName.textContent = project.name;
  if (!list) return;
  const members = AppData.members.filter((member) => !project || member.projectId === project.id);
  list.innerHTML = members.length
    ? members.map((member) => `<article class="contribution-card"><span class="avatar ${escapeHtml(member.color)}">${escapeHtml(member.initials)}</span><div><h3>${escapeHtml(member.email)} ${member.status === "Away" ? '<span class="badge badge-warning">Away</span>' : ""}</h3><p>${escapeHtml(member.status)} · ${member.score || 0}/100 contribution score</p><div class="progress"><i style="width:${Number(member.score || 0)}%"></i></div></div><div class="contribution-score">${Number(member.score || 0)}<small>/100</small></div></article>`).join("")
    : '<p class="muted">No groupmates yet. Add a Gmail address to add a member.</p>';
});
