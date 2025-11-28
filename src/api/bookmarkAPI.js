// src/api/bookmarkAPI.js
import apiClient from './index';

/**
 
 * @param {number} courseId - 북마크할 코스의 ID
 * @returns {Promise<object>} API 응답 데이터
 */
export const createBookmark = async (courseId) => {
  const response = await apiClient.post('/bookmarks', { courseId: courseId });
  return response.data;
};

/**

 * @param {number} courseId - 삭제할 북마크의 ID
 * @returns {Promise<object>} API 응답 데이터
 */
export const deleteBookmark = async (courseId) => {
  const response = await apiClient.delete(`/bookmarks/${courseId}`);
  return response.data;
};

/**
 * 저장된 북마크 목록을 조회하는 API
 * @param {string} order 
 * @returns {Promise<object>}
 */
export const getBookmarks = async (order) => {
  const response = await apiClient.get('/bookmarks', { params: { order } });
  return response.data;
};