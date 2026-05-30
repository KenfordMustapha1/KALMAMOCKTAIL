import api from './api';

export const createPreOrder = async (items) => {
  const { data } = await api.post('/preorders', { items });
  return data;
};

export const getPreOrderByToken = async (token) => {
  const { data } = await api.get(`/preorders/${token}`);
  return data;
};

export const redeemPreOrder = async (token) => {
  const { data } = await api.post(`/preorders/${token}/redeem`);
  return data;
};

export const getMyPreOrders = async () => {
  const { data } = await api.get('/preorders/mine');
  return data;
};
