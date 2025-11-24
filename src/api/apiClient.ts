import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'https://ssam.suzuyagroup.com/api',
  timeout: 15000,
});

apiClient.interceptors.response.use(
  response => response,
  error => {
    // Normalisasi error untuk dipakai di layer atas
    return Promise.reject(error);
  },
);
