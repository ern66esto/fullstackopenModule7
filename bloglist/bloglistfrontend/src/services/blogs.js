import apiClient from './apiClient';
import axios from 'axios';

const getAll = async () => {
  const response = await apiClient.get('/blogs');
  return response.data;
};

const create = async (newObject) => {
  const response = await apiClient.post('/blogs', newObject);
  return response.data;
};

const update = async (id, newObject) => {
  const response = await apiClient.put(`/blogs/${id}`, newObject);
  return response.data;
};

const remove = async (id) => {
  const response = await apiClient.delete(`/blogs/${id}`);
  return response.data;
};

export default { getAll, create, update, remove };
