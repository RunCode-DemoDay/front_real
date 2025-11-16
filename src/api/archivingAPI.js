// src/api/archivingAPI.js
import apiClient from './index';

/**
 * ✅ 썸네일 업로드를 위한 Presigned URL을 백엔드로부터 받아옵니다.
 * GET /archivings/presigned-url
 */
export const getPresignedUrl = async () => {
  const res = await apiClient.get(`/archivings/presigned-url`);
  return res.data; // { success, code, message, data: { presignedUrl, imageUrl } }
};

/**
 * [GET] /archivings/{archivingId} - 아카이빙 상세 정보 조회
 * @param {string|number} archivingId
 * @returns {Promise<object>} API 응답 데이터 (data.data 에 상세 정보 포함)
 */
export const fetchArchivingDetail = async (archivingId) => {
  const response = await apiClient.get(`/archivings/${archivingId}`);
  return response.data; 
};

/**
 * [POST] /archivings - 새로운 아카이빙 생성
 * @param {object} archivingData - 생성할 아카이빙 데이터
 * @returns {Promise<object>} API 응답 데이터 (data.data.archiving_id 로 새 ID 확인)
 */
export const createArchiving = async (archivingData) => {
  const response = await apiClient.post('/archivings', archivingData);
  return response.data;
};

/**
 * [PATCH] /archivings/{archivingId} - 아카이빙 정보 수정 (제목, 내용 등)
 * @param {string|number} archivingId
 * @param {object} updateData - 수정할 데이터 { title, content }
 * @returns {Promise<object>} API 응답 데이터
 */
export const updateArchiving = async (archivingId, updateData) => {
  const response = await apiClient.patch(`/archivings/${archivingId}`, updateData);
  return response.data;
};

/**
 * [GET] /courses/{courseId}/archivings - 특정 코스의 다른 아카이빙 목록 조회
 * @param {string|number} courseId
 * @returns {Promise<object>} API 응답 데이터
 */
export const fetchArchivingsByCourse = async (courseId) => {
    const response = await apiClient.get(`/courses/${courseId}/archivings`);
    return response.data;
};

/**
 * [PATCH] /archivings/{archivingId}/image - 아카이빙 이미지 업로드/수정
 * @param {string|number} archivingId
 * @param {string} imageBase64 - Base64 인코딩된 이미지 데이터
 * @returns {Promise<object>} API 응답 데이터
 */
export const updateArchivingImage = async (archivingId, imageBase64) => {
    // Base64 데이터 URL에서 실제 데이터 부분만 추출 (e.g., "data:image/jpeg;base64,")
    const base64Data = imageBase64.split(',')[1];
    const response = await apiClient.patch(`/archivings/${archivingId}/image`, {
        image: base64Data
    });
    return response.data;
}