// src/api/courseAPI.js
import apiClient from "./index";

/**
 * 코스를 검색합니다. (GET /courses/search)
 * @param {string} query - 검색어
 * @param {string} order - 정렬 기준
 * @returns {Promise<object>} 검색된 코스 목록
 */
export const searchCourses = async (query, order) => {
  try {
    const response = await apiClient.get(`/courses/search?query=${query}&order=${order}`);
   
    return response.data;
  } catch (error) {
    console.error('코스 검색 API 오류:', error);
  
    return error.response?.data || { success: false, message: '네트워크 오류 또는 서버 응답 없음' };
  }
};