// src/api/index.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://runcode.shop',
  withCredentials: true,
});

// 요청 인터셉터 (Request Interceptor)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    
    // 모든 요청에 기본적으로 Content-Type 설정
    config.headers['Content-Type'] = 'application/json';

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;