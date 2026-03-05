const USERS_KEY = 'playnow_users';

export const ADMIN_EMAIL = 'admin@playnow.com';
export const ADMIN_PASSWORD = 'Admin@12345';

const getStoredUsers = () => {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const signupUser = ({ fullName, email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  if (normalizedEmail === ADMIN_EMAIL) {
    throw new Error('This email is reserved for system admin.');
  }

  const users = getStoredUsers();
  const exists = users.some((user) => user.email === normalizedEmail);
  if (exists) {
    throw new Error('An account with this email already exists.');
  }

  const newUser = {
    id: Date.now().toString(),
    fullName: fullName.trim(),
    email: normalizedEmail,
    password,
    role: 'User',
  };

  saveUsers([newUser, ...users]);
  return newUser;
};

export const loginUser = ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  if (normalizedEmail === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const adminSession = {
      role: 'Admin',
      token: 'admin-demo-token',
      fullName: 'System Admin',
      email: ADMIN_EMAIL,
    };

    localStorage.setItem('role', adminSession.role);
    localStorage.setItem('token', adminSession.token);
    localStorage.setItem('currentUser', JSON.stringify(adminSession));
    return adminSession;
  }

  const users = getStoredUsers();
  const matchedUser = users.find(
    (user) => user.email === normalizedEmail && user.password === password,
  );

  if (!matchedUser) {
    throw new Error('Invalid email or password.');
  }

  const userSession = {
    role: matchedUser.role,
    token: `user-token-${matchedUser.id}`,
    fullName: matchedUser.fullName,
    email: matchedUser.email,
  };

  localStorage.setItem('role', userSession.role);
  localStorage.setItem('token', userSession.token);
  localStorage.setItem('currentUser', JSON.stringify(userSession));

  return userSession;
};

export const logoutUser = () => {
  localStorage.removeItem('role');
  localStorage.removeItem('token');
  localStorage.removeItem('currentUser');
};

export const isAuthenticated = () => {
  return Boolean(localStorage.getItem('token'));
};
