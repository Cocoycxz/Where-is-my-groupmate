document.addEventListener("DOMContentLoaded", () => {
  const list = document.querySelector("#notification-list");
  if (list)
    list.innerHTML = AppData.notifications
      .map(
        (n) =>
          `<div class="list-item"><span class="dot"></span><p>${n.text}<br><small>${n.time}</small></p></div>`,
      )
      .join("");
});
