// src/api/courseDetailAPI.js
import apiClient from "./index";

/**
 
 * @param {string|number} courseId
 * @returns {Promise<object>} API 응답 데이터 (data.data 에 상세 정보 포함)
 */
export const getCourseDetail = async (courseId) => {
  const response = await apiClient.get(`/courses/${courseId}`);
  return response.data;
};

export const getCourseInfo = async (courseId) => {
  const response = await apiClient.get(`/courses/${courseId}/summary`);
  return response.data;
};

export const getCourseArchiving = async (courseId) => {
  const response = await apiClient.get(`/courses/${courseId}/archivings`);
  return response.data;
};

/**
 * @param {object} params - { courseId, order }
 * @returns {Promise<object>} API 응답 데이터
 */
export const getCourseReviews = async ({ courseId, order }) => {
  const response = await apiClient.get(`/courses/${courseId}/reviews?order=${order}`);
  return response.data;
};
