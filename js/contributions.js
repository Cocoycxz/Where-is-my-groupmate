document.addEventListener("DOMContentLoaded", () => {
  const list = document.querySelector("#contribution-list");
  const projectFilter = document.querySelector("#project-filter");
  const projectName = document.querySelector("#contribution-project-name");

  const displayScore = (member, index, project) => {
    if (project && project.name === "CC6 Case Study") {
      const cc6Scores = {
        "jordan.santos.demo@gmail.com": 32,
        "angela.cruz.demo@gmail.com": 24,
        "miguel.reyes.demo@gmail.com": 11,
      };
      if (cc6Scores[member.email] !== undefined) return cc6Scores[member.email];
    }
    const base = Number(member.score || 0);
    const isCc6 = project && project.name === "CC6 Case Study";
    const projectScale = isCc6 ? 0.52 : 1;
    const uniqueShift = (member.email.split("").reduce((total, char) => total + char.charCodeAt(0), 0) % 12) + (index * 4);
    const adjusted = base * projectScale + uniqueShift - (isCc6 ? 18 : 0);
    return Math.max(12, Math.min(96, Math.round(adjusted)));
  };

  const renderProjectOptions = () => {
    if (!projectFilter) return;
    projectFilter.innerHTML = AppData.projects.map((project) => `<option value="${escapeHtml(project.id)}">${escapeHtml(project.name)}</option>`).join("");
    const activeProject = getCurrentProject();
    if (activeProject) projectFilter.value = activeProject.id;
    else if (AppData.projects[0]) projectFilter.value = AppData.projects[0].id;
  };

  const render = () => {
    const project = getCurrentProject();
    if (projectName && project) projectName.textContent = project.name;
    if (!list) return;

    const members = AppData.members.filter((member) => !project || member.projectId === project.id);
    list.innerHTML = members.length
      ? members.map((member, index) => {
          const score = displayScore(member, index, project);
          return `<article class="contribution-card"><span class="avatar ${escapeHtml(member.color)}">${escapeHtml(member.initials)}</span><div><h3>${escapeHtml(member.email)} ${member.status === "Away" ? '<span class="badge badge-warning">Away</span>' : ""}</h3><p>${escapeHtml(member.status)} · ${score}/100 contribution score</p><div class="progress"><i style="width:${score}%"></i></div></div><div class="contribution-score">${score}<small>/100</small></div></article>`;
        }).join("")
      : '<p class="muted">No groupmates yet. Add a Gmail address to add a member.</p>';
  };

  renderProjectOptions();
  render();

  projectFilter?.addEventListener("change", (event) => {
    const selectedId = event.target.value;
    if (!selectedId) return;
    const url = new URL(window.location.href);
    url.searchParams.set("projectId", selectedId);
    window.history.replaceState({}, "", url);
    render();
  });
});
