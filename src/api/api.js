// src/api/api.js

import axios from "axios";

// 1. 환경 변수에서 백엔드 API 기본 URL 가져오기
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  console.error(
    "VITE_API_BASE_URL is not defined. Please check your .env file."
  );
}

// 2. 모든 API 요청에 적용될 기본 axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// 3. 요청 인터셉터: 모든 요청에 인증 토큰을 자동으로 추가
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken") || localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});