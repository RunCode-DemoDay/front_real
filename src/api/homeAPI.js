// src/api/homeAPI.js
import apiClient from "./index"; // apiClient 사용

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
  const res = await apiClient.get(`/types`);

  return res.data; // 그대로 반환 (정규화는 페이지에서 처리)
};

/**
 * 태그별 코스 조회
 * GET /courses?tag=태그이름&order=정렬옵션
 */
export const getCoursesByTag = async ({ tag, order }) => {
  const res = await apiClient.get(`/courses`, {
    params: { tag, order },
  });

  return res.data;
};
