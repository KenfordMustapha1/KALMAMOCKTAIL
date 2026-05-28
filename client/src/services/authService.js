import api from './api';

export const register = async (userData) => {
  const { data } = await api.post('/auth/register', userData);
  return data;
};

export const login = async (credentials) => {
  const { data } = await api.post('/auth/login', credentials);
  return data;
};

export const getProfile = async () => {
  const { data } = await api.get('/auth/profile');
  return data;
};

export const updateProfile = async (userData) => {
  const { data } = await api.put('/auth/profile', userData);
  return data;
};

export const getAdminSetupStatus = async () => {
  const { data } = await api.get('/auth/admin/setup-status');
  return data;
};

export const setupAdmin = async (adminData) => {
  const { data } = await api.post('/auth/admin/setup', adminData);
  return data;
};
