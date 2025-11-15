// src/api/index.js
import axios from 'axios';

// 1. 환경 변수에서 백엔드 API 기본 URL 가져오기
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  console.error(
    "VITE_API_BASE_URL is not defined. Please check your .env file."
  );
}

// 2. 모든 API 요청에 적용될 기본 axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// 3. 요청 인터셉터: 모든 요청에 인증 토큰과 Content-Type을 자동으로 추가
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

/**
 * API 팩토리: 환경 변수에 따라 실제 API 또는 Mock API를 선택적으로 반환합니다.
 * 컴포넌트에서는 이 팩토리를 통해 API 함수를 import하여 사용합니다.
 * 
 * 예: import { archivingAPI } from './api';
 */
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