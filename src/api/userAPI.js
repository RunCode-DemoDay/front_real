// src/api/userAPI.js
import apiClient from "./index";

// 내 정보 조회
export async function getMyInfo() {
  const res = await apiClient.get("/users/me");
  return res.data;
}

// 내 정보 수정
export async function patchInfo(params) {
  const res = await apiClient.patch("/users/me", params);
  return res.data;
}

// 리뷰 미작성 코스 조회
export const getUnreviewedCourses = async () => {
  try {
    const response = await apiClient.get("/users/me/courses/unreviewed");
    return response.data;
  } catch (error) {
    console.error("리뷰 미작성 코스 조회 API 오류:", error);
    return (
      error.response?.data || {
        success: false,
        message: "네트워크 오류 또는 서버 응답 없음",
      }
    );
  }
};

// 내가 작성한 리뷰 목록 조회
export const getMyreviewedCourses = async () => {
  try {
    const response = await apiClient.get("/users/me/reviews");
    return response.data;
  } catch (error) {
    console.error("작성한 리뷰 조회 API 오류:", error);
    return (
      error.response?.data || {
        success: false,
        message: "네트워크 오류 또는 서버 응답 없음",
      }
    );
  }
};

// 아카이빙된 코스 목록 조회
export const getMyArchivedCourses = async () => {
  try {
    const response = await apiClient.get("/users/me/courses/archived");
    return response.data;
  } catch (error) {
    console.error("아카이빙 코스 조회 API 오류:", error);
    return (
      error.response?.data || {
        success: false,
        message: "네트워크 오류 또는 서버 응답 없음",
      }
    );
  }
};

// ✅ 리뷰 삭제 API
// DELETE /courses/{courseId}/reviews/{reviewId}
export const deleteCourseReview = async ({ courseId, reviewId }) => {
  try {
    const response = await apiClient.delete(
      `/courses/${courseId}/reviews/${reviewId}`
    );
    // 응답 예시: { success, code, message, data: { reviewId, courseId } }
    return response.data;
  } catch (error) {
    console.error("리뷰 삭제 API 오류:", error);
    return (
      error.response?.data || {
        success: false,
        message: "네트워크 오류 또는 서버 응답 없음",
      }
    );
  }
};
