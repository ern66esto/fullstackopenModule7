import apiClient from './apiClient';

const getAll = async () => {
  const response = await apiClient.get('/users');
  return response.data;
};

const getById = async (id) => {
  const response = await apiClient.get(`/users/${id}`);
  return response.data;
};

export default { getAll, getById };
