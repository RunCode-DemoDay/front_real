// src/api/bookmarkAPI.js
import apiClient from "./index";

/**
 * UI에서 선택한 정렬 옵션 → 백엔드에서 기대하는 정렬 파라미터 매핑
 * 실제 백엔드 스펙에 따라 아래 값만 바꿔주면 됨
 */
const BOOKMARK_ORDER_MAP = {
  latest: "latest", // 최신순
  DISTANCE_ASC: "distance", // 짧은순 (백엔드 스펙에 맞게 수정)
  RATING_DESC: "rating", // 별점순 (백엔드 스펙에 맞게 수정)
};

/**
 * 북마크 생성
 */
export const createBookmark = async (courseId) => {
  const response = await apiClient.post("/bookmarks", { courseId });
  return response.data;
};

/**
 * 북마크 삭제
 */
export const deleteBookmark = async (courseId) => {
  const response = await apiClient.delete(`/bookmarks/${courseId}`);
  return response.data;
};

/**
 * 북마크 목록 조회
 */
export const getBookmarks = async (orderKey = "latest") => {
  // UI에서 온 orderKey → 백엔드에서 이해하는 orderParam으로 변환
  const orderParam = BOOKMARK_ORDER_MAP[orderKey] || BOOKMARK_ORDER_MAP.latest;

  const response = await apiClient.get("/bookmarks", {
    params: { order: orderParam },
  });

  return response.data;
};
