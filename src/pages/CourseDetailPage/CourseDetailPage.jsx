// src/pages/CourseDetailPage/CourseDetailPage.jsx

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCourseDetail, getCourseReviews } from "../../api/courseDetailAPI"; // ✅ 실제 API 함수로 변경
import FixedBottomButton from "../../component/FixedBottomButton/FixedBottomButton";
import ImageSwiper from "../../component/ImageSwiper/ImageSwiper";
import AppContainer from "../../AppContainer/AppContainer";
import CourseReviewSection from "../../component/CourseReviewSection/CourseReviewSection";
import "./CourseDetailPage.css";

// 1. 모든 아이콘 에셋 링크 정의 (유지)
const ASSET_ICONS = {
  back: "https://runcode-likelion.s3.us-east-2.amazonaws.com/global/back.svg",
  bookmark_on:
    "https://runcode-likelion.s3.us-east-2.amazonaws.com/course/save_on.svg",
  bookmark_off:
    "https://runcode-likelion.s3.us-east-2.amazonaws.com/course/save_off.svg",
  location:
    "https://runcode-likelion.s3.us-east-2.amazonaws.com/course/detail/location.svg",
  distance:
    "https://runcode-likelion.s3.us-east-2.amazonaws.com/course/detail/distance.svg",
  avg_star:
    "https://runcode-likelion.s3.us-east-2.amazonaws.com/course/detail/avg_star.svg",
  star_on:
    "https://runcode-likelion.s3.us-east-2.amazonaws.com/course/detail/star_on.svg",
  star_off:
    "https://runcode-likelion.s3.us-east-2.amazonaws.com/course/detail/star_off.svg",
  right_arrow:
    "https://runcode-likelion.s3.us-east-2.amazonaws.com/course/detail/right_arrow.svg",
};

// ✅ 기본 썸네일 이미지 경로
const DEFAULT_THUMBNAIL = "/course_img.jpg";

// MapComponent는 메인 파일에 남겨둡니다.
const MapComponent = ({ thumbnail }) => (
  <div className="c-detail-map-component">
    <img src={thumbnail} alt="코스 지도" className="c-detail-map-image" />
  </div>
);

function CourseDetailPage() {
  const urlParams = useParams();
  const navigate = useNavigate();
  const courseId = urlParams.courseId || "1";

  // 🔍 이 페이지에서 courseId 확인
  console.log("%c[CourseDetail] useParams:", "color: #00bcd4", urlParams);
  console.log("%c[CourseDetail] courseId 최종값:", "color: #00bcd4", courseId);

  const [detailData, setDetailData] = useState(null);
  const [reviewData, setReviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    console.log(
      "%c[CourseDetail] useEffect loadData 시작, courseId = " + courseId,
      "color: #9c27b0"
    );

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [detailRes, reviewRes] = await Promise.all([
          getCourseDetail(courseId), // ✅ 실제 API 호출
          getCourseReviews({ courseId, order: "LATEST" }), // ✅ 실제 API 호출
        ]);

        console.log(
          "%c[CourseDetail] getCourseDetail 응답:",
          "color: #9c27b0",
          detailRes
        );
        console.log(
          "%c[CourseDetail] getCourseReviews 응답:",
          "color: #9c27b0",
          reviewRes
        );

        if (detailRes.success && detailRes.data) {
          setDetailData(detailRes.data);
          setIsBookmarked(detailRes.data.isBookmarked);
          console.log(
            "%c[CourseDetail] detailData 세팅 완료:",
            "color: #9c27b0",
            detailRes.data
          );
        }

        if (reviewRes.success && reviewRes.data) {
          setReviewData(reviewRes.data);
          console.log(
            "%c[CourseDetail] reviewData 세팅 완료:",
            "color: #9c27b0",
            reviewRes.data
          );
        }
      } catch (err) {
        console.error("[CourseDetail] 데이터 로드 실패:", err);
        setError("코스 정보를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [courseId]);

  const handleBookmarkToggle = useCallback(() => {
    console.log(
      "%c[CourseDetail] 북마크 토글 클릭, 이전 상태:",
      "color: #ff9800",
      isBookmarked
    );
    setIsBookmarked((prev) => !prev);
  }, [isBookmarked]);

  // ✅ 러닝 시작 → 카운트다운 페이지로 이동 (코스 제목 state로 전달)
  const handleStartRunning = useCallback(() => {
    console.log('%c[CourseDetail] "러닝 시작" 클릭', "color: #4caf50");
    console.log("%c[CourseDetail] RunningCount로 넘길 값:", "color: #4caf50", {
      courseIdFromParam: courseId,
      courseTitle: detailData?.title,
      star_average: detailData?.star_average,
      review_count: detailData?.review_count,
      courseDistance: detailData?.distance,
    });

    navigate(`/running/count/${courseId}`, {
      state: {
        courseId: courseId,
        courseTitle: detailData?.title || "",
        star_average: detailData?.star_average,
        review_count: detailData?.review_count,
        courseDistance: detailData?.distance, // 코스의 원래 거리 추가
      },
    });
  }, [courseId, detailData, navigate]);

  const handleReviewViewAll = useCallback(() => {
    console.log(
      "%c[CourseDetail] 리뷰 전체보기 클릭, courseId = " + courseId,
      "color: #ff5722"
    );
    navigate(`/course/${courseId}/reviews`);
  }, [courseId, navigate]);

  // 로딩 및 에러 처리
  if (loading) {
    return (
      <AppContainer>
        <div className="loading-screen">코스 정보 로딩 중...</div>
      </AppContainer>
    );
  }

  if (error || !detailData) {
    console.error("[CourseDetail] error or no detailData:", error, detailData);
    return (
      <AppContainer>
        <div className="error-screen">오류: {error || "정보 없음"}</div>
      </AppContainer>
    );
  }

  // ✅ 데이터 가공: 잘못된 이미지 경로를 수정하고 ImageSwiper에 전달할 배열 통합
  const sanitizeImageUrl = (url) => {
    if (url && !url.includes("/public/")) {
      return url;
    }
    return DEFAULT_THUMBNAIL;
  };

  const detailImages = detailData.detailImages || [];
  const allCourseImages = [
    sanitizeImageUrl(detailData.thumbnail),
    ...detailImages.map(sanitizeImageUrl),
  ];

  const distanceString = `${detailData.distance}km`;
  const bookmarkIconSrc = isBookmarked
    ? ASSET_ICONS.bookmark_on
    : ASSET_ICONS.bookmark_off;

  // JSX 렌더링
  return (
    <AppContainer>
      <div className="c-detail-container">
        {/* 1. 상단 버튼 오버레이 (Absolute positioned) */}
        <div className="c-detail-top-buttons-overlay">
          <button
            className="c-detail-back-button-overlay"
            onClick={() => navigate(-1)}
          >
            <img
              src={ASSET_ICONS.back}
              alt="뒤로가기"
              className="c-detail-back-icon"
            />
          </button>
        </div>

        {/* ⭐ 2. 스크롤 가능한 콘텐츠 묶음 (모든 콘텐츠 포함) */}
        <div className="c-detail-scroll-content-wrapper">
          {/* 메인 정보 섹션 */}
          <div className="c-detail-main-info-section">
            <div className="c-detail-header-row">
              <h1 className="c-detail-course-title">{detailData.title}</h1>
              {/* 북마크 버튼을 제목 옆에 배치 */}
              <button
                className="c-detail-bookmark-button-overlay"
                onClick={handleBookmarkToggle}
              >
                <img
                  src={bookmarkIconSrc}
                  alt="저장"
                  className="c-detail-bookmark-icon-img"
                />
              </button>
            </div>

            <p className="c-detail-course-content">{detailData.content}</p>

            {/* 메타 정보 (위치, 거리 아이콘 적용) */}
            <div className="c-detail-course-meta-info">
              <p className="c-detail-address-text">
                <img
                  src={ASSET_ICONS.location}
                  alt="위치"
                  className="c-detail-meta-icon"
                />
                {detailData.address}
              </p>
              <p className="c-detail-distance-text">
                <img
                  src={ASSET_ICONS.distance}
                  alt="거리"
                  className="c-detail-meta-icon"
                />
                약 {distanceString} {detailData.distance_description}
              </p>
            </div>
          </div>

          {/* ⭐ 3. ImageSwiper 영역 (지도/이미지 위치) */}
          <div className="c-detail-map-section">
            <ImageSwiper
              images={allCourseImages}
              className="c-detail-MapSwiper"
            />
          </div>

          {/* 4. 리뷰 섹션 */}
          <CourseReviewSection
            reviewData={reviewData}
            onReviewViewAll={null}
            ASSET_ICONS={ASSET_ICONS}
            maxItems={2}
          />

          {/* ⭐ 5. 전체보기 버튼을 리뷰 섹션 하단에 배치 */}
          <span
            className="c-detail-review-view-all-bottom"
            onClick={handleReviewViewAll}
          >
            전체보기
            <img
              src={ASSET_ICONS.right_arrow}
              alt="전체보기"
              className="c-detail-right-arrow-icon"
            />
          </span>
        </div>

        {/* 6. 하단 고정 버튼 (FixedBottomButton) */}
        <FixedBottomButton
          label="러닝 시작"
          onClick={handleStartRunning}
          backgroundColor="#FF003C"
          className="c-detail-fixed-bottom-button-wrapper"
        />
      </div>
    </AppContainer>
  );
}

export default CourseDetailPage;
