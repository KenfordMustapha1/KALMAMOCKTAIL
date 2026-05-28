import api from './api';

export const getCustomers = async () => {
  const { data } = await api.get('/users/customers');
  return data;
};

export const getAnalytics = async () => {
  const { data } = await api.get('/analytics');
  return data;
};
