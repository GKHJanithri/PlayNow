const STORAGE_KEY = 'playnow.notifications';
const MAX_NOTIFICATIONS = 50;
const NOTIFICATION_TTL_MS = 3 * 24 * 60 * 60 * 1000;

const defaultNotifications = [
  {
    id: "welcome-note",
    title: "Welcome to PlayNow",
    message: "Track your bookings, teams, and event updates from one dashboard.",
    icon: "fa-bell",
    role: "System",
    createdAt: new Date().toISOString(), // Added so the date sorting doesn't break
  },
];

export const getNotifications = () => {
  let items = [];
  
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      items = Array.isArray(parsed) ? parsed : [];
    }
  } catch (_error) {
    // If JSON parsing fails, fall back to an empty array
    items = [];
  }

  // If there are no saved notifications, return the default welcome message
  if (items.length === 0) {
    return defaultNotifications;
  }

  const now = Date.now();
  const activeItems = items.filter((item) => {
    const createdAtMs = new Date(item?.createdAt).getTime();
    if (!Number.isFinite(createdAtMs)) return false;
    return now - createdAtMs < NOTIFICATION_TTL_MS;
  });

  // Keep storage clean by removing expired or malformed notifications as soon as we read.
  if (activeItems.length !== items.length) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activeItems));
  }

  // Sort newest to oldest
  return activeItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const addNotification = ({ title, message, icon = 'fa-bell', role = 'System' }) => {
  if (!title || !message) return;

  const current = getNotifications();
  
  // Filter out the default notification so we don't accidentally save it to localStorage
  const filteredCurrent = current.filter(n => n.id !== "welcome-note");

  const nextItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    message,
    icon,
    role,
    createdAt: new Date().toISOString(),
  };

  const next = [nextItem, ...filteredCurrent].slice(0, MAX_NOTIFICATIONS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
};