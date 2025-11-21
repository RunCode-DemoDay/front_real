// src/api/archivingAPI.js
import apiClient from "./index";

/**
 * ✅ Presigned URL 발급 API
 * POST /s3/upload-url
 * Query Params: fileName, contentType
 */
// export const getPresignedUrl = async (fileName, contentType) => {
//   const res = await apiClient.get("/s3/upload-url", {
//     params: { fileName, contentType },
//   });
//   return res.data;   // 여기까지 확실히 수정
// };
export const getPresignedUrl = async (fileName, contentType) => {
  console.log(
    "%c[API] getPresignedUrl 호출",
    "color:#3f51b5; font-weight:bold;",
    { fileName, contentType }
  );

  const res = await apiClient.get("/s3/upload-url", {
    params: { fileName, contentType },
  });

  console.log("[API] getPresignedUrl 응답:", res.data);

  const { success, data, message } = res.data;

  if (!success || !data) {
    throw new Error(message || "Presigned URL 발급 실패");
  }

  // 🔹 data = "https://...archivings/yuyi-test.png?쿼리들..."
  const presignedUrl = data; // PUT 할 때 쓸 URL (쿼리 포함)
  const imageUrl = data.split("?")[0]; // DB에 저장할 URL (쿼리 제거)

  return { presignedUrl, imageUrl };
};

/**
 * [GET] /archivings/{archivingId} - 아카이빙 상세 조회
 */
export const fetchArchivingDetail = async (archivingId) => {
  const response = await apiClient.get(`/archivings/${archivingId}`);
  return response.data;
};

/**
 * [POST] /archivings - 새로운 아카이빙 생성
 */
export const createArchiving = async (archivingData) => {
  console.log(
    "%c[API] createArchiving() 요청:",
    "color:#4caf50; font-weight:bold;",
    archivingData
  );

  const response = await apiClient.post("/archivings", archivingData);
  return response.data;
};

/**
 * [PATCH] /archivings/{archivingId} - 제목/내용 수정
 */
export const updateArchiving = async (archivingId, updateData) => {
  const response = await apiClient.patch(
    `/archivings/${archivingId}`,
    updateData
  );
  return response.data;
};

/**
 * [GET] /courses/{courseId}/archivings - 동일 코스 아카이빙 목록
 */
export const fetchArchivingsByCourse = async (courseId) => {
  const response = await apiClient.get(`/courses/${courseId}/archivings`);
  return response.data;
};

/**
 * [PATCH] /archivings/{archivingId}/image - 베이스64 이미지 업로드
 */
export const updateArchivingImage = async (archivingId, imageBase64) => {
  const base64Data = imageBase64.split(",")[1];
  const response = await apiClient.patch(`/archivings/${archivingId}/image`, {
    image: base64Data,
  });
  return response.data;
};

/**
 * [GET] /archivings?order= - 전체 아카이빙 조회
 */
export const getMyArchivedAll = async (order) => {
  const response = await apiClient.get(`/archivings?order=${order}`);
  return response.data;
};
