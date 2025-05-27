import apiClient from './apiClient';

const login = async (credentials) => {
  const response = await apiClient.post('/login', credentials);
  return response.data;
};

export default { login };
