import axios from 'axios';

export const toolsApiClient = axios.create({
  baseURL: 'http://szytoolsapi.suzuyagroup.com:8181',
  timeout: 15000,
});

toolsApiClient.interceptors.response.use(
  response => response,
  error => {
    return Promise.reject(error);
  },
);
