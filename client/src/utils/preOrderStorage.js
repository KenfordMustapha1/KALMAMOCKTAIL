const ACTIVE_PREORDER_KEY = 'kalmaActivePreOrder';

export const saveActivePreOrderToken = (token) => {
  localStorage.setItem(ACTIVE_PREORDER_KEY, token);
};

export const getActivePreOrderToken = () => {
  return localStorage.getItem(ACTIVE_PREORDER_KEY);
};

export const clearActivePreOrderToken = () => {
  localStorage.removeItem(ACTIVE_PREORDER_KEY);
};
