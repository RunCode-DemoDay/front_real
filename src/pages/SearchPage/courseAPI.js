// src/api/courseAPI.js
import axios from './axiosInstance';

/**
 * 코스를 검색합니다. (GET /courses/search)
 * @param {string} query - 검색어
 * @param {string} order - 정렬 기준
 * @returns {Promise<object>} 검색된 코스 목록
 */
export const searchCourses = async (query, order) => {
  try {
    const response = await axios.get('/courses/search', {
      params: {
        query,
        order,
      },
    });
    // 실제 데이터는 response.data.data 에 있습니다.
    return response.data;
  } catch (error) {
    console.error('코스 검색 API 오류:', error);
    // 실패 시 success: false 와 에러 메시지를 포함하는 객체를 반환하도록 통일합니다.
    return error.response?.data || { success: false, message: '네트워크 오류 또는 서버 응답 없음' };
  }
};