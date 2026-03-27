const defaultNotifications = [
  {
    id: "welcome-note",
    title: "Welcome to PlayNow",
    message: "Track your bookings, teams, and event updates from one dashboard.",
  },
];

export const getNotifications = () => {
  try {
    const raw = localStorage.getItem("studentNotifications");
    if (!raw) return defaultNotifications;

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : defaultNotifications;
  } catch (_error) {
    return defaultNotifications;
  }
};

