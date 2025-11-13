// src/api/homeAPI.js
import axios from "axios";

const API_BASE_URL = "/api";
axios.defaults.withCredentials = true;

// 로컬에서 액세스토큰 꺼내기 (키 이름 혼용 대비)
const getStoredAccessToken = () => {
  return (
    localStorage.getItem("accessToken") ||
    localStorage.getItem("access_token") ||
    null
  );
};

/**
 * 런비티아이 + 태그 4종류 조회
 * GET /types
 * 서버 응답 예)
 * {
 *   success: true,
 *   code: 200,
 *   message: "...",
 *   data: {
 *     type_id, name, description, thumbnail,
 *     tags: [{ tag_id, name }, ...]
 *   }
 * }
 */
export const getTypesWithTags = async () => {
  const token = getStoredAccessToken();
  if (!token) {
    console.warn("[homeAPI] access token 없음 → /types 호출 생략");
    return { success: false, code: 401, message: "no token" };
  }

  const res = await axios.get(`${API_BASE_URL}/types`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });

  return res.data; // 그대로 반환 (정규화는 페이지에서 처리)
};

/**
 * 태그별 코스 조회
 * GET /courses?tag=태그이름&order=정렬옵션
 */
export const getCoursesByTag = async ({ tag, order }) => {
  const token = getStoredAccessToken();
  if (!token) {
    console.warn("[homeAPI] access token 없음 → /courses 호출 생략");
    return { success: false, code: 401, message: "no token" };
  }

  const res = await axios.get(`${API_BASE_URL}/courses`, {
    params: { tag, order },
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });

  return res.data;
};
