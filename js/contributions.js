document.addEventListener("DOMContentLoaded", () => {
  const list = document.querySelector("#contribution-list");
  if (list)
    list.innerHTML = AppData.members
      .map(
        (m) =>
          `<article class="contribution-card"><span class="avatar ${m.color}">${m.initials}</span><div><h3>${m.name} ${m.inactive ? '<span class="badge badge-warning">Needs attention</span>' : ""}</h3><p>${m.role} · ${m.inactive ? "No activity in 6 days" : "Active this week"}</p><div class="progress"><i style="width:${m.score}%"></i></div></div><div class="contribution-score">${m.score}<small>/100</small></div></article>`,
      )
      .join("");
});
