window.AppData = {
  user: { name: "Alex Rivera", initials: "AR" },
  projects: [
    {
      id: 1,
      name: "Capstone Research",
      course: "CS 401 · Group 3",
      progress: 72,
      due: "Friday, Sep 20",
      status: "On track",
      description:
        "A collaborative study on the role of AI-assisted feedback in student learning.",
    },
    {
      id: 2,
      name: "Sustainability Campaign",
      course: "COM 212 · Group 6",
      progress: 38,
      due: "Oct 2",
      status: "Needs attention",
      description:
        "A campus awareness campaign focused on practical waste reduction.",
    },
  ],
  members: [
    {
      name: "Alex Rivera",
      initials: "AR",
      role: "Research lead",
      score: 94,
      color: "violet",
    },
    {
      name: "Jordan Santos",
      initials: "JS",
      role: "Writer",
      score: 88,
      color: "blue",
    },
    {
      name: "Mia Cruz",
      initials: "MC",
      role: "Designer",
      score: 76,
      color: "orange",
    },
    {
      name: "David Lim",
      initials: "DL",
      role: "Data analyst",
      score: 42,
      color: "green",
      inactive: true,
    },
  ],
  tasks: [
    {
      id: 1,
      title: "Finalize research questions",
      assignee: "Alex Rivera",
      due: "Sep 16",
      status: "Done",
    },
    {
      id: 2,
      title: "Complete literature review",
      assignee: "Jordan Santos",
      due: "Sep 17",
      status: "In progress",
    },
    {
      id: 3,
      title: "Design survey draft",
      assignee: "Mia Cruz",
      due: "Sep 18",
      status: "In progress",
    },
    {
      id: 4,
      title: "Analyze pilot data",
      assignee: "David Lim",
      due: "Sep 19",
      status: "Not started",
    },
  ],
  activities: [
    { text: "Jordan completed Literature review notes", time: "12 min ago" },
    { text: "Mia uploaded Survey draft v2", time: "2 hours ago" },
    { text: "You created “Analyze pilot data”", time: "Yesterday" },
  ],
  notifications: [
    {
      text: "David has not logged activity in 6 days.",
      time: "Today",
      type: "attention",
    },
    {
      text: "Your peer evaluation opens on Sep 18.",
      time: "Yesterday",
      type: "info",
    },
  ],
};
