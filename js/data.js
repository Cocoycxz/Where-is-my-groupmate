const storageKeys = {
  projects: "wimg-projects",
  tasks: "wimg-tasks",
  members: "wimg-members",
  activities: "wimg-activities",
  notifications: "wimg-notifications",
  currentUser: "wimg-current-user",
};

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    return false;
  }
  return true;
}

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function initialsFor(value) {
  return value.split(/[. @_-]+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join("");
}

function escapeHtml(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function formatDate(value) {
  if (!value) return "No deadline";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function statusClass(status) {
  if (["Completed", "Done", "Active", "Working"].includes(status)) return "badge-success";
  if (["In Progress", "In progress", "On Hold", "Away"].includes(status)) return "badge-warning";
  return "badge-neutral";
}

function projectProgress(projectId) {
  const projectTasks = AppData.tasks.filter((task) => task.projectId === projectId);
  if (!projectTasks.length) return 0;
  return Math.round((projectTasks.filter((task) => task.status === "Completed").length / projectTasks.length) * 100);
}

function saveAll() {
  writeStorage(storageKeys.projects, AppData.projects);
  writeStorage(storageKeys.tasks, AppData.tasks);
  writeStorage(storageKeys.members, AppData.members);
  writeStorage(storageKeys.activities, AppData.activities);
  writeStorage(storageKeys.notifications, AppData.notifications);
  writeStorage(storageKeys.currentUser, AppData.user);
}

function addActivity({ projectId, memberEmail, action, taskId = "", taskTitle = "" }) {
  AppData.activities.unshift({ id: makeId("activity"), projectId, memberEmail: memberEmail || AppData.user.email, action, taskId, taskTitle, timestamp: new Date().toISOString() });
  AppData.activities = AppData.activities.slice(0, 50);
  writeStorage(storageKeys.activities, AppData.activities);
}

function addNotification(text, type = "info") {
  AppData.notifications.unshift({ id: makeId("notification"), text, time: "Just now", type });
  writeStorage(storageKeys.notifications, AppData.notifications);
}

function activityText(activity) {
  const subject = activity.taskTitle ? `“${escapeHtml(activity.taskTitle)}”` : "the project";
  return `${escapeHtml(activity.memberEmail)} ${escapeHtml(activity.action || "updated")} ${subject}`;
}

function timeAgo(timestamp) {
  if (!timestamp) return "Earlier";
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  return `${Math.floor(hours / 24)} day${hours < 48 ? "" : "s"} ago`;
}

function getProject(projectId) {
  return AppData.projects.find((project) => project.id === projectId) || AppData.projects[0];
}

function getCurrentProject() {
  return getProject(new URLSearchParams(location.search).get("projectId"));
}

function createProject({ name, description, deadline, status }) {
  const project = { id: makeId("project"), name: name.trim(), description: description.trim(), deadline, status, course: "Student workspace", createdAt: new Date().toISOString() };
  AppData.projects.unshift(project);
  saveAll();
  addActivity({ projectId: project.id, action: "created", taskTitle: project.name });
  return project;
}

function deleteProject(projectId) {
  AppData.projects = AppData.projects.filter((project) => project.id !== projectId);
  AppData.tasks = AppData.tasks.filter((task) => task.projectId !== projectId);
  AppData.members = AppData.members.filter((member) => member.projectId !== projectId);
  AppData.activities = AppData.activities.filter((activity) => activity.projectId !== projectId);
  saveAll();
}

function addMember(projectId, email) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9._%+-]*@gmail\.com$/.test(normalizedEmail)) return { error: "Please enter a valid Gmail address." };
  if (AppData.members.some((member) => member.projectId === projectId && member.email === normalizedEmail)) return { error: "This groupmate is already added." };
  const member = { id: makeId("member"), email: normalizedEmail, name: normalizedEmail.split("@")[0], initials: initialsFor(normalizedEmail), role: "Groupmate", score: 0, color: "blue", status: "Active", projectId };
  AppData.members.push(member);
  saveAll();
  addActivity({ projectId, action: "added", taskTitle: normalizedEmail });
  return { member };
}

function removeMember(memberId) {
  const member = AppData.members.find((item) => item.id === memberId);
  if (!member) return;
  AppData.members = AppData.members.filter((item) => item.id !== memberId);
  AppData.tasks = AppData.tasks.map((task) => task.assignedTo === member.email ? { ...task, assignedTo: "" } : task);
  saveAll();
  addActivity({ projectId: member.projectId, action: "removed", taskTitle: member.email });
}

function saveTask(taskInput, existingTask) {
  const now = new Date().toISOString();
  const task = existingTask ? { ...existingTask, ...taskInput, updatedAt: now } : { ...taskInput, id: makeId("task"), createdAt: now, updatedAt: now };
  const index = AppData.tasks.findIndex((item) => item.id === task.id);
  if (index === -1) AppData.tasks.unshift(task);
  else AppData.tasks[index] = task;
  saveAll();
  addActivity({ projectId: task.projectId, memberEmail: task.assignedTo, action: existingTask ? "updated" : "created", taskId: task.id, taskTitle: task.title });
  if (task.status === "Completed") addActivity({ projectId: task.projectId, memberEmail: task.assignedTo, action: "completed", taskId: task.id, taskTitle: task.title });
  return task;
}

function advanceTaskProgress(taskId) {
  const currentTask = AppData.tasks.find((task) => task.id === taskId);
  if (!currentTask) return null;
  if (!AppData.user?.email || currentTask.assignedTo !== AppData.user.email) return null;
  if (currentTask.status !== "To Do") return null;
  const updatedTask = { ...currentTask, status: "In Progress", updatedAt: new Date().toISOString() };
  const index = AppData.tasks.findIndex((task) => task.id === taskId);
  if (index >= 0) AppData.tasks[index] = updatedTask;
  saveAll();
  addActivity({ projectId: updatedTask.projectId, memberEmail: updatedTask.assignedTo, action: "updated", taskId: updatedTask.id, taskTitle: updatedTask.title });
  return updatedTask;
}

function submitTask(taskId) {
  const currentTask = AppData.tasks.find((task) => task.id === taskId);
  if (!currentTask || !AppData.user?.email || currentTask.assignedTo !== AppData.user.email || currentTask.status !== "In Progress") return null;
  const updatedTask = { ...currentTask, status: "Completed", submittedAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  const index = AppData.tasks.findIndex((task) => task.id === taskId);
  if (index >= 0) AppData.tasks[index] = updatedTask;
  saveAll();
  addActivity({ projectId: updatedTask.projectId, memberEmail: updatedTask.assignedTo, action: "completed", taskId: updatedTask.id, taskTitle: updatedTask.title });
  return updatedTask;
}

function deleteTask(taskId) {
  const task = AppData.tasks.find((item) => item.id === taskId);
  if (!task) return;
  AppData.tasks = AppData.tasks.filter((item) => item.id !== taskId);
  saveAll();
  addActivity({ projectId: task.projectId, action: "deleted", taskId, taskTitle: task.title });
}

let AppData = { user: {}, projects: [], members: [], tasks: [], activities: [], notifications: [] };

const memberIdentityChanges = {
  "jordan.santos.demo@gmail.com": "joshua.guevarra@gmail.com",
  "angela.cruz.demo@gmail.com": "kyle.liagao@gmail.com",
  "miguel.reyes.demo@gmail.com": "paul.matthew@gmail.com",
};

const memberDisplayNameChanges = {
  "Jordan Santos": "joshua.guevarra@gmail.com",
  "Angela Cruz": "kyle.liagao@gmail.com",
  "Miguel Reyes": "paul.matthew@gmail.com",
};

function migrateMemberIdentities() {
  let changed = false;
  const updateEmail = (email) => memberIdentityChanges[email] || email;

  AppData.members = AppData.members.map((member) => {
    const email = updateEmail(member.email);
    if (email === member.email) return member;
    changed = true;
    return { ...member, email, name: email, initials: initialsFor(email) };
  });
  AppData.tasks = AppData.tasks.map((task) => {
    const assignedTo = updateEmail(task.assignedTo);
    if (assignedTo === task.assignedTo) return task;
    changed = true;
    return { ...task, assignedTo };
  });
  AppData.activities = AppData.activities.map((activity) => {
    const memberEmail = updateEmail(activity.memberEmail);
    if (memberEmail === activity.memberEmail) return activity;
    changed = true;
    return { ...activity, memberEmail };
  });
  AppData.notifications = AppData.notifications.map((notification) => {
    if (typeof notification.text !== "string") return notification;
    let text = notification.text;
    Object.entries(memberDisplayNameChanges).forEach(([oldName, newName]) => {
      text = text.replaceAll(oldName, newName);
    });
    Object.entries(memberIdentityChanges).forEach(([oldEmail, newEmail]) => {
      text = text.replaceAll(oldEmail, newEmail);
    });
    if (text === notification.text) return notification;
    changed = true;
    return { ...notification, text };
  });

  const userEmail = updateEmail(AppData.user?.email);
  if (userEmail !== AppData.user?.email) {
    AppData.user = { ...AppData.user, email: userEmail, name: userEmail, initials: initialsFor(userEmail) };
    changed = true;
  }

  if (changed) {
    writeStorage(storageKeys.members, AppData.members);
    writeStorage(storageKeys.tasks, AppData.tasks);
    writeStorage(storageKeys.activities, AppData.activities);
    writeStorage(storageKeys.notifications, AppData.notifications);
    writeStorage(storageKeys.currentUser, AppData.user);
  }
}

function seedData() {
  if (localStorage.getItem(storageKeys.projects) !== null) {
    AppData.projects = readStorage(storageKeys.projects, []);
    AppData.tasks = readStorage(storageKeys.tasks, []);
    AppData.members = readStorage(storageKeys.members, []);
    AppData.activities = readStorage(storageKeys.activities, []);
    AppData.notifications = readStorage(storageKeys.notifications, []);
    AppData.user = readStorage(storageKeys.currentUser, { name: "Raphael Perote", email: "raphael.demo@gmail.com", initials: "RP", course: "BS Computer Science" });
    migrateMemberIdentities();
    return;
  }
  const projectId = "demo-project";
  const secondProjectId = "demo-project-cc6";
  const demoMembers = [
    ["joshua.guevarra@gmail.com", "joshua.guevarra@gmail.com", "Writer", "blue", "Working"],
    ["kyle.liagao@gmail.com", "kyle.liagao@gmail.com", "Designer", "orange", "Active"],
    ["paul.matthew@gmail.com", "paul.matthew@gmail.com", "Researcher", "green", "Away"],
  ].map(([email, name, role, color, status], index) => ({ id: `demo-member-${index + 1}`, email, name, initials: initialsFor(name), role, score: [92, 68, 54][index], color, status, projectId }));
  const demoMembersCc6 = [
    ["raphael.demo@gmail.com", "Raphael Perote", "Developer", "purple", "Working"],
    ["joshua.guevarra@gmail.com", "joshua.guevarra@gmail.com", "Researcher", "blue", "Active"],
    ["paul.matthew@gmail.com", "paul.matthew@gmail.com", "Editor", "green", "Away"],
  ].map(([email, name, role, color, status], index) => ({ id: `demo-member-cc6-${index + 1}`, email, name, initials: initialsFor(name), role, score: [46, 38, 25][index], color, status, projectId: secondProjectId }));
  const demoTasks = [
    ["Create project proposal", "joshua.guevarra@gmail.com", "2026-09-25", "Completed"],
    ["Design UI", "kyle.liagao@gmail.com", "2026-09-28", "Completed"],
    ["Build login page", "kyle.liagao@gmail.com", "2026-10-03", "In Progress"],
    ["Database research", "paul.matthew@gmail.com", "2026-10-07", "Completed"],
    ["Prepare presentation", "joshua.guevarra@gmail.com", "2026-10-15", "To Do"],
  ].map(([title, assignedTo, deadline, status], index) => ({ id: `demo-task-${index + 1}`, projectId, title, description: "Demo task", assignedTo, deadline, status, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }));
  const demoTasksCc6 = [
    ["Research", "raphael.demo@gmail.com", "2026-10-05", "In Progress"],
    ["Write case study", "joshua.guevarra@gmail.com", "2026-10-09", "To Do"],
    ["Compile findings", "paul.matthew@gmail.com", "2026-10-12", "Completed"],
  ].map(([title, assignedTo, deadline, status], index) => ({ id: `demo-task-cc6-${index + 1}`, projectId: secondProjectId, title, description: "CC6 case study task", assignedTo, deadline, status, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }));
  AppData = {
    user: { name: "Raphael Perote", email: "raphael.demo@gmail.com", initials: "RP", course: "BS Computer Science" },
    projects: [
      { id: projectId, name: "Where Is My Groupmate?", description: "Student group project management system", deadline: "2026-10-20", status: "In Progress", course: "Student workspace", createdAt: new Date().toISOString() },
      { id: secondProjectId, name: "CC6 Case Study", description: "Case study project for the CC6 course", deadline: "2026-10-16", status: "In Progress", course: "Student workspace", createdAt: new Date().toISOString() },
    ],
    members: [...demoMembers, ...demoMembersCc6],
    tasks: [...demoTasks, ...demoTasksCc6],
    activities: [...demoTasks.slice(0, 3).map((task, index) => ({ id: `demo-activity-${index + 1}`, projectId, memberEmail: task.assignedTo, action: task.status === "Completed" ? "completed" : "created", taskId: task.id, taskTitle: task.title, timestamp: new Date(Date.now() - index * 3600000).toISOString() })), ...demoTasksCc6.slice(0, 3).map((task, index) => ({ id: `demo-activity-cc6-${index + 1}`, projectId: secondProjectId, memberEmail: task.assignedTo, action: task.status === "Completed" ? "completed" : "created", taskId: task.id, taskTitle: task.title, timestamp: new Date(Date.now() - (index + 3) * 3600000).toISOString() }))],
    notifications: [
      { id: "demo-notification-1", text: "Your demo workspace is ready.", time: "Today", type: "info" },
      { id: "demo-notification-2", text: "joshua.guevarra@gmail.com updated the project proposal and left a note.", time: "Yesterday", type: "info" },
      { id: "demo-notification-3", text: "kyle.liagao@gmail.com marked the UI design as completed.", time: "2 days ago", type: "success" },
      { id: "demo-notification-4", text: "You have a task due tomorrow for the login page.", time: "3 days ago", type: "warning" },
    ],
  };
  saveAll();
}

seedData();
window.AppData = AppData;
