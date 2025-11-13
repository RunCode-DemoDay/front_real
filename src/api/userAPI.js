// src/api/userAPI.js
import axios from "axios";

// ✅ /users/me : 사용자 정보 조회
export async function getMyInfo() {
  // 토큰은 localStorage에서 꺼냄 (AuthHandler에서 저장해둔 것)
  const token =
    (typeof window !== "undefined" &&
      (localStorage.getItem("accessToken") ||
        localStorage.getItem("access_token"))) ||
    null;

  const res = await axios.get("/api/users/me", {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    withCredentials: true,
  });

  // 명세서 기준: { success, code, message, data: { ...user } }
  return res.data;
}
