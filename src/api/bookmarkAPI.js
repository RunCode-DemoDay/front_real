// src/api/bookmarkAPI.js
import apiClient from './index';

/**
 * 북마크를 생성하는 API
 * @param {number} courseId - 북마크할 코스의 ID
 * @returns {Promise<object>} API 응답 데이터
 */
export const createBookmark = async (courseId) => {
  const response = await apiClient.post('/bookmarks', { course_id: courseId });
  return response.data;
};

/**
 * 북마크를 삭제하는 API
 * @param {number} bookmarkId - 삭제할 북마크의 ID
 * @returns {Promise<object>} API 응답 데이터
 */
export const deleteBookmark = async (bookmarkId) => {
  const response = await apiClient.delete(`/bookmarks/${bookmarkId}`);
  return response.data;
};

/**
 * 저장된 북마크 목록을 조회하는 API
 * @param {string} order - 정렬 순서 (LATEST, DISTANCE_ASC, RATING_DESC)
 * @returns {Promise<object>} API 응답 데이터
 */
export const getBookmarks = async (order) => {
  const response = await apiClient.get('/bookmarks', { params: { order } });
  return response.data;
};