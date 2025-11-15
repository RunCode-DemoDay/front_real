// src/api/userAPI.js
import apiClient from "./index";

// ✅ /users/me : 사용자 정보 조회
export async function getMyInfo() {
  // apiClient에 baseURL, withCredentials, Authorization 헤더가
  // 자동으로 설정되므로 코드가 매우 간결해집니다.
  const res = await apiClient.get("/users/me");

  // 명세서 기준: { success, code, message, data: { ...user } }
  return res.data;
}
