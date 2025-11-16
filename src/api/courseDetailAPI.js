// src/api/courseDetailAPI.js
import apiClient from "./index";

/**
 * [GET] /courses/{courseId} - 코스 상세 정보 조회
 * @param {string|number} courseId
 * @returns {Promise<object>} API 응답 데이터 (data.data 에 상세 정보 포함)
 */
export const getCourseDetail = async (courseId) => {
  const response = await apiClient.get(`/courses/${courseId}`);
  return response.data;
};

/**
 * [GET] /courses/{courseId}/reviews - 특정 코스의 리뷰 목록 조회
 * @param {object} params - { courseId, order }
 * @returns {Promise<object>} API 응답 데이터
 */
export const getCourseReviews = async ({ courseId, order }) => {
  const response = await apiClient.get(`/courses/${courseId}/reviews`, {
    params: { order },
  });
  return response.data;
};
