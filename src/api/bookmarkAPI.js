// src/api/bookmarkAPI.js
import apiClient from "./index";

/**
 * UI에서 사용하는 정렬 키 → 백엔드가 기대하는 order 파라미터 값 매핑
 *
 * UI 값 (SavedCoursesPage / CustomSelect) 예시:
 * - "latest"        : 최신순
 * - "DISTANCE_ASC"  : 거리 짧은순
 * - "RATING_DESC"   : 별점 높은순
 *
 * 아래 값은 백엔드 명세에 맞게 필요하면 바꿔주면 됨.
 */
const BOOKMARK_ORDER_MAP = {
  latest: "latest", // 최신순
  DISTANCE_ASC: "distance", // 짧은순  (예시: 'distance' 혹은 'DISTANCE_ASC' 등 실제 스펙에 맞게)
  RATING_DESC: "rating", // 별점순  (예시: 'rating' 혹은 'RATING_DESC' 등 실제 스펙에 맞게)
};

/**
 * 북마크 생성 API
 * @param {number} courseId - 북마크할 코스의 ID
 * @returns {Promise<object>} API 응답 데이터
 */
export const createBookmark = async (courseId) => {
  const response = await apiClient.post("/bookmarks", { courseId });
  return response.data;
};

/**
 * 북마크 삭제 API
 * @param {number} courseId - 북마크를 해제할 코스의 ID
 * @returns {Promise<object>} API 응답 데이터
 */
export const deleteBookmark = async (courseId) => {
  const response = await apiClient.delete(`/bookmarks/${courseId}`);
  return response.data;
};

/**
 * 저장된 북마크 목록 조회 API
 * @param {string} orderKey - UI에서 사용하는 정렬 키 (latest / DISTANCE_ASC / RATING_DESC)
 * @returns {Promise<object>} API 응답 데이터
 */
export const getBookmarks = async (orderKey = "latest") => {
  // UI에서 넘어온 값을 백엔드 스펙에 맞는 값으로 변환
  const orderParam = BOOKMARK_ORDER_MAP[orderKey] || BOOKMARK_ORDER_MAP.latest;

  const response = await apiClient.get("/bookmarks", {
    params: { order: orderParam },
  });

  return response.data;
};
