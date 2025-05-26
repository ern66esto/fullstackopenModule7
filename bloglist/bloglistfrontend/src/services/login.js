// import axios from 'axios';
// const baseUrl = '/api/login';
import apiClient from './apiClient';

const login = async (credentials) => {
  // const response = await axios.post(baseUrl, credentials);
  const response = await apiClient.post('/login', credentials);
  return response.data;
};

export default { login };
