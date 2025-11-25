// src/api/userAPI.js
import apiClient from "./index";


export async function getMyInfo() {

  const res = await apiClient.get("/users/me");

 
  return res.data;
}

export async function patchInfo(params) {
  const res = await apiClient.patch("/users/me", params);
  return res.data;

}


export const getUnreviewedCourses = async () => {
  try {
    const response = await apiClient.get('/users/me/courses/unreviewed');
    return response.data;
  } catch (error) {
    console.error('리뷰 미작성 코스 조회 API 오류:', error);
    return error.response?.data || { success: false, message: '네트워크 오류 또는 서버 응답 없음' };
  }
};


export const getMyreviewedCourses = async () => {
  try {
    const response = await apiClient.get('/users/me/reviews');
    return response.data;
  } catch (error) {
    console.error('작성한 리뷰 조회 API 오류:', error);
    return error.response?.data || { success: false, message: '네트워크 오류 또는 서버 응답 없음' };
  }
};


export const getMyArchivedCourses = async () => {
  try {
    const response = await apiClient.get('/users/me/courses/archived');
    return response.data;
  } catch (error) {
    console.error('작성한 리뷰 조회 API 오류:', error);
    return error.response?.data || { success: false, message: '네트워크 오류 또는 서버 응답 없음' };
  } 
}
