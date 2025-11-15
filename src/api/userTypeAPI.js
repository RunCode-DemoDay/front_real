// src/api/userTypeAPI.js
import { apiClient } from "./api"; // ✅ apiClient import

const API_PREFIX = ""; // '/api' 제거

/** 코드(HFNT 등)로 타입 조회 */
export const getTypeByCode = async ({ code }) => {
  // apiClient가 인증 토큰을 자동으로 추가해줍니다.
  const res = await apiClient.get(`${API_PREFIX}/types`, {
    params: { code },
  });

  // 백 responses: { success, code, message, data }
  const data = res.data?.data ?? res.data;
  return Array.isArray(data) ? data[0] : data;
};

/**
 * ✅ 최종 버전: 내 러너 유형 저장
 * body → { "typeCode": "HFNT" }
 */
export const patchMyType = async ({ typeCode }) => {
  const res = await apiClient.patch(
    `${API_PREFIX}/users/me`,
    { typeCode } // ★ 여기가 핵심
  );

  return res.data; // { success, code, message, data: {...user} }
};
