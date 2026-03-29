const STORAGE_KEY = 'playnow.notifications';
const MAX_NOTIFICATIONS = 50;
const NOTIFICATION_TTL_MS = 3 * 24 * 60 * 60 * 1000;

const safeParse = (raw) => {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
};

export const getNotifications = () => {
  const items = safeParse(localStorage.getItem(STORAGE_KEY));
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

  return activeItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const addNotification = ({ title, message, icon = 'fa-bell', role = 'System' }) => {
  if (!title || !message) return;

  const current = getNotifications();
  const nextItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    message,
    icon,
    role,
    createdAt: new Date().toISOString(),
  };

  const next = [nextItem, ...current].slice(0, MAX_NOTIFICATIONS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
};
