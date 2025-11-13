// src/api/authAPI.js
import axios from "axios";

const API_BASE_URL = "/api";
axios.defaults.withCredentials = true;

// "필요하면"만 refresh 하는 함수
export const refreshAccessToken = async () => {
  // 1. 먼저 로컬에 accessToken 있는지 본다
  const storedAccess =
    localStorage.getItem("accessToken") ||
    localStorage.getItem("access_token");

  if (storedAccess) {
    // 이미 있으면 이걸로 그냥 쓰게 해
    return storedAccess;
  }

  // 2. accessToken이 없을 때만 refresh 시도
  const storedRefresh =
    localStorage.getItem("refreshToken") ||
    localStorage.getItem("refresh_token");

  if (!storedRefresh) {
    console.warn("⚠️ 로컬에 refresh 토큰도 없어서 새 토큰 못 만듦");
    return null;
  }

  try {
    const res = await axios.post(
      `${API_BASE_URL}/auth/token/refresh`,
      {
        refreshToken: storedRefresh,
      },
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const newAccess =
      res.data?.data?.accessToken ||
      res.data?.data?.access_token ||
      res.data?.accessToken ||
      res.data?.access_token;

    const newRefresh =
      res.data?.data?.refreshToken || res.data?.data?.refresh_token;

    if (newAccess) {
      localStorage.setItem("accessToken", newAccess);
      localStorage.setItem("access_token", newAccess);
    }
    if (newRefresh) {
      localStorage.setItem("refreshToken", newRefresh);
      localStorage.setItem("refresh_token", newRefresh);
    }

    return newAccess ?? null;
  } catch (err) {
    console.error("🔴 refresh 실패:", err.response?.data || err.message);
    return null;
  }
};
