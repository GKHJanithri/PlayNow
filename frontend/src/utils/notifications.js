const STORAGE_KEY = 'playnow.notifications';
const MAX_NOTIFICATIONS = 50;
const NOTIFICATION_TTL_MS = 3 * 24 * 60 * 60 * 1000;
const DEFAULT_AUDIENCE = ['Admin', 'Coach', 'Student', 'User'];

const normalizeRole = (role) => {
  const value = String(role || '').trim();
  if (!value) return 'Guest';
  if (value === 'User') return 'Student';
  return value;
};

const normalizeAudience = (roles) => {
  const list = Array.isArray(roles) ? roles : [];
  if (list.length === 0) return DEFAULT_AUDIENCE;

  const normalized = Array.from(
    new Set(
      list
        .map((role) => normalizeRole(role))
        .filter((role) => role !== 'Guest'),
    ),
  );

  return normalized.length > 0 ? normalized : DEFAULT_AUDIENCE;
};

const isVisibleToRole = (item, role) => {
  const audience = normalizeAudience(item?.audienceRoles);
  const normalizedRole = normalizeRole(role);
  return audience.includes(normalizedRole);
};

const defaultNotifications = [
  {
    id: "welcome-note",
    title: "Welcome to PlayNow",
    message: "Track your bookings, teams, and event updates from one dashboard.",
    icon: "fa-bell",
    role: "System",
    audienceRoles: DEFAULT_AUDIENCE,
    createdAt: new Date().toISOString(),
  },
];

export const getNotifications = (role = localStorage.getItem('role') || 'Guest') => {
  let items = [];
  
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      items = Array.isArray(parsed) ? parsed : [];
    }
  } catch {
    items = [];
  }

  const filteredDefaults = defaultNotifications.filter((item) => isVisibleToRole(item, role));

  if (items.length === 0) {
    return filteredDefaults;
  }

  const now = Date.now();
  const activeItems = items.filter((item) => {
    const createdAtMs = new Date(item?.createdAt).getTime();
    if (!Number.isFinite(createdAtMs)) return false;
    return now - createdAtMs < NOTIFICATION_TTL_MS;
  });

  if (activeItems.length !== items.length) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activeItems));
  }

  const visibleItems = activeItems.filter((item) => isVisibleToRole(item, role));

  if (visibleItems.length === 0) {
    return filteredDefaults;
  }

  return visibleItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const addNotification = ({
  title,
  message,
  icon = 'fa-bell',
  role = 'System',
  audienceRoles = DEFAULT_AUDIENCE,
}) => {
  if (!title || !message) return;

  let current = [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    current = Array.isArray(parsed) ? parsed : [];
  } catch {
    current = [];
  }

  const filteredCurrent = current.filter((n) => n.id !== 'welcome-note');

  const nextItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    message,
    icon,
    role,
    audienceRoles: normalizeAudience(audienceRoles),
    createdAt: new Date().toISOString(),
  };

  const next = [nextItem, ...filteredCurrent].slice(0, MAX_NOTIFICATIONS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
};