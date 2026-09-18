document.addEventListener("DOMContentLoaded", () => {
  const list = document.querySelector("#notification-list");
  if (!list) return;
  list.innerHTML = AppData.notifications.length
    ? AppData.notifications.map((notification) => `<div class="list-item"><span class="dot"></span><p>${escapeHtml(notification.text)}<br><small>${escapeHtml(notification.time || timeAgo(notification.timestamp))}</small></p></div>`).join("")
    : '<p class="muted">No notifications yet.</p>';
});
