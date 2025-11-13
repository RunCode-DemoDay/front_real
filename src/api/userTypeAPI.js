// src/api/userTypeAPI.js
import axios from "axios";

const API = "/api";
axios.defaults.withCredentials = true;

/** 코드(HFNT 등)로 타입 조회 */
export const getTypeByCode = async ({ code, token }) => {
  const res = await axios.get(`${API}/types`, {
    params: { code },
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  // 백 responses: { success, code, message, data }
  const data = res.data?.data ?? res.data;
  return Array.isArray(data) ? data[0] : data;
};

/** ✅ 최종 버전: 내 러너 유형 저장
 * body → { "typeCode": "HFNT" }
 */
export const patchMyType = async ({ typeCode, token }) => {
  const res = await axios.patch(
    `${API}/users/me`,
    { typeCode }, // ★ 여기가 핵심
    {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );

  return res.data; // { success, code, message, data: {...user} }
};
