import apiClient from '../api/client';

const readErrorMessage = (error, fallback) => {
  return error?.response?.data?.message || error?.message || fallback;
};

const persistSession = (session) => {
  localStorage.setItem('role', session.role);
  localStorage.setItem('token', session.token);
  localStorage.setItem('currentUser', JSON.stringify(session));
};

export const signupUser = async ({ fullName, studentId, role, email, password }) => {
  try {
    const response = await apiClient.post('/auth/signup', {
      fullName,
      studentId,
      role,
      email,
      password,
    });

    const session = {
      role: response.data.role,
      token: response.data.token,
      fullName: response.data.fullName,
      email: response.data.email,
    };

    persistSession(session);
    return session;
  } catch (error) {
    throw new Error(readErrorMessage(error, 'Signup failed.'));
  }
};

export const loginUser = async ({ email, password }) => {
  try {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });

    const session = {
      role: response.data.role,
      token: response.data.token,
      fullName: response.data.fullName,
      email: response.data.email,
    };

    persistSession(session);
    return session;
  } catch (error) {
    throw new Error(readErrorMessage(error, 'Login failed.'));
  }
};

export const logoutUser = () => {
  localStorage.removeItem('role');
  localStorage.removeItem('token');
  localStorage.removeItem('currentUser');
};

export const isAuthenticated = () => {
  return Boolean(localStorage.getItem('token'));
};
