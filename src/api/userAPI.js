// src/api/userAPI.js
import apiClient from "./index";

// ✅ /users/me : 사용자 정보 조회
export async function getMyInfo() {
  // apiClient에 baseURL, withCredentials, Authorization 헤더가
  // 자동으로 설정되므로 코드가 매우 간결해집니다.
  const res = await apiClient.get("/users/me");

  // 명세서 기준: { success, code, message, data: { ...user } }
  return res.data;
}

export async function patchInfo(params) {
  const res = await apiClient.patch("/users/me", params);
  return res.data;

}

/**
 * 리뷰를 작성하지 않은 코스 목록을 조회합니다.
 * GET /users/me/courses/unreviewed
 */
export const getUnreviewedCourses = async () => {
  try {
    const response = await apiClient.get('/users/me/courses/unreviewed');
    return response.data;
  } catch (error) {
    console.error('리뷰 미작성 코스 조회 API 오류:', error);
    return error.response?.data || { success: false, message: '네트워크 오류 또는 서버 응답 없음' };
  }
};

/**
 * 내가 작성한 리뷰 목록을 조회합니다.
 * GET /users/me/reviews
 */
export const getMyreviewedCourses = async () => {
  try {
    const response = await apiClient.get('/users/me/reviews');
    return response.data;
  } catch (error) {
    console.error('작성한 리뷰 조회 API 오류:', error);
    return error.response?.data || { success: false, message: '네트워크 오류 또는 서버 응답 없음' };
  }
};