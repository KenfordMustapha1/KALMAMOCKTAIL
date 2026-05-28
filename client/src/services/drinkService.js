import api from './api';

export const getDrinks = async (params = {}) => {
  const { data } = await api.get('/drinks', { params });
  return data;
};

export const getDrinkById = async (id) => {
  const { data } = await api.get(`/drinks/${id}`);
  return data;
};

export const createDrink = async (drinkData) => {
  const { data } = await api.post('/drinks', drinkData);
  return data;
};

export const updateDrink = async (id, drinkData) => {
  const { data } = await api.put(`/drinks/${id}`, drinkData);
  return data;
};

export const deleteDrink = async (id) => {
  const { data } = await api.delete(`/drinks/${id}`);
  return data;
};
