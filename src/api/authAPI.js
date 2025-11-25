// src/api/authAPI.js
import apiClient from "./index";


export const refreshAccessToken = async () => {
 
  const storedAccess =
    localStorage.getItem("accessToken") ||
    localStorage.getItem("access_token");

  if (storedAccess) {
    // 이미 있으면 이걸로 그냥 쓰게 해
    return storedAccess;
  }


  const storedRefresh =
    localStorage.getItem("refreshToken") ||
    localStorage.getItem("refresh_token");

  if (!storedRefresh) {
    console.warn("⚠️ 로컬에 refresh 토큰도 없어서 새 토큰 못 만듦");
    return null;
  }

  try {
  
    const res = await apiClient.post("/auth/token/refresh", { refreshToken: storedRefresh });

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
