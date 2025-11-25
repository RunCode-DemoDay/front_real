// src/api/index.js
import axios from 'axios';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  console.error(
    "VITE_API_BASE_URL is not defined. Please check your .env file."
  );
}


const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});


apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    config.headers['Content-Type'] = 'application/json';
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


const createApiFactory = (realApi, mockApi) => {
  const useMock = import.meta.env.VITE_USE_MOCK_API === 'true';
  if (useMock) {
    console.log(`[API Factory] Using MOCK API for ${Object.keys(realApi).join(', ')}`);
    return mockApi;
  }
  return realApi;
};

// export { createApiFactory }; // 필요에 따라 API 그룹별로 팩토리 생성
export default apiClient;