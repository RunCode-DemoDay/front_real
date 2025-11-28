// src/pages/ReviewMy/ReviewMy.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import StarIcon from "../../assets/Star.svg";
import "./ReviewMy.css";

import { getMyreviewedCourses, deleteCourseReview } from "../../api/userAPI";

// 아이콘 S3 URL
const ICONS = {
  LeftArrow:
    "https://runcode-likelion.s3.us-east-2.amazonaws.com/global/back.svg",
  Distance:
    "https://runcode-likelion.s3.us-east-2.amazonaws.com/course/distance.svg",
  Reviews:
    "https://runcode-likelion.s3.us-east-2.amazonaws.com/course/review.svg",
  Setting: "https://runcode-likelion.s3.us-east-2.amazonaws.com/my/setting.svg",
};

// 별 아이콘 S3 URL
const STAR_ON =
  "https://runcode-likelion.s3.us-east-2.amazonaws.com/course/detail/star_on.svg";
const STAR_OFF =
  "https://runcode-likelion.s3.us-east-2.amazonaws.com/course/detail/star_off.svg";

// ⭐ rating 만큼 색칠되는 별
const Stars = ({ value }) => {
  const filled = Math.max(0, Math.min(5, Math.floor(Number(value) || 0)));

  return (
    <div className="reviewmy-stars" aria-label={`별점 ${filled}점`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <img
          key={i}
          src={i < filled ? STAR_ON : STAR_OFF}
          alt={i < filled ? "채워진 별" : "빈 별"}
          className="reviewmy-star-icon"
        />
      ))}
    </div>
  );
};

const ReviewMy = () => {
  const navigate = useNavigate();
  const handleBack = () => navigate(-1);

  // ✅ 리뷰 목록
  const [reviews, setReviews] = useState([]);
  // ✅ 로딩 상태
  const [loading, setLoading] = useState(true);

  // ✅ 어떤 카드의 점3개 메뉴가 열려 있는지
  const [openedMenuId, setOpenedMenuId] = useState(null);
  // ✅ 삭제 확인 모달 표시 여부
  const [showConfirm, setShowConfirm] = useState(false);
  // ✅ 실제 삭제 대상 { reviewId, courseId }
  const [targetReview, setTargetReview] = useState(null);

  // 리뷰 목록 조회
  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const result = await getMyreviewedCourses();
        if (result.success && Array.isArray(result.data)) {
          setReviews(result.data);
        } else {
          console.error("작성한 리뷰 조회 실패:", result.message);
        }
      } catch (error) {
        console.error("작성한 리뷰 조회 중 에러 발생:", error);
      }
      setLoading(false);
    };
    fetchReviews();
  }, []);

  // 점 3개 버튼 클릭
  const handleMoreClick = (e, reviewId) => {
    e.stopPropagation();
    setOpenedMenuId((prev) => (prev === reviewId ? null : reviewId));
  };

  // "리뷰 삭제" 인라인 버튼 클릭 → 모달 띄우기
  const handleDeleteClick = (e, review) => {
    e.stopPropagation();
    setTargetReview({
      reviewId: review.review_id,
      courseId: review.course_id, // ⚠️ 응답 필드명에 맞춰서 사용 (courseId / course_id)
    });
    setShowConfirm(true);
    setOpenedMenuId(null);
  };

  // 모달에서 "아니요" 또는 바깥 클릭
  const handleConfirmCancel = () => {
    setShowConfirm(false);
    setTargetReview(null);
  };

  // 모달에서 "예" 클릭 → 삭제 API 호출
  const handleConfirmOk = async () => {
    if (!targetReview) return;

    const result = await deleteCourseReview({
      courseId: targetReview.courseId,
      reviewId: targetReview.reviewId,
    });

    if (!result.success) {
      alert(result.message || "리뷰 삭제에 실패했습니다.");
      setShowConfirm(false);
      return;
    }

    // ✅ 프론트 목록에서도 삭제
    setReviews((prev) =>
      prev.filter((r) => r.review_id !== targetReview.reviewId)
    );

    setShowConfirm(false);
    setTargetReview(null);

    // 필요하면 삭제 후 마이페이지 이동
    // navigate("/mypage");
  };

  return (
    <div className="reviewmy-page">
      {/* 헤더 */}
      <header className="reviewmy-header">
        <button
          type="button"
          className="reviewmy-back-btn"
          onClick={handleBack}
        >
          <img
            className="reviewmy-back-icon"
            src={ICONS.LeftArrow}
            alt="뒤로가기"
          />
        </button>

        <div className="reviewmy-title-row">
          <h2 className="reviewmy-title">작성한 리뷰</h2>
          {!loading && (
            <span className="reviewmy-count">({reviews.length})</span>
          )}
        </div>
      </header>

      {/* 본문 */}
      <main className="reviewmy-content">
        {loading ? (
          <p className="reviewmy-loading">리뷰를 불러오는 중입니다...</p>
        ) : reviews.length === 0 ? (
          <p className="reviewmy-empty">작성한 리뷰가 없습니다.</p>
        ) : (
          <ul className="reviewmy-list">
            {reviews.map((r) => (
              <li key={r.review_id} className="reviewmy-item">
                {/* 상단: 썸네일 + 코스정보 + ... */}
                <div className="reviewmy-top">
                  <div className="reviewmy-thumb">
                    <img src={r.course_thumbnail} alt={r.course_title} />
                  </div>

                  <div className="reviewmy-info">
                    <p className="reviewmy-course-title">{r.course_title}</p>

                    <div className="reviewmy-meta">
                      <span>
                        <img
                          className="reviewmy-meta-icon"
                          src={StarIcon}
                          alt=""
                          aria-hidden="true"
                        />
                        {r.course_star_average.toFixed(2)}
                      </span>
                      <span>
                        <img
                          className="reviewmy-meta-icon"
                          src={ICONS.Reviews}
                          alt=""
                          aria-hidden="true"
                        />
                        리뷰 {r.course_review_count}건
                      </span>
                      <span>
                        <img
                          className="reviewmy-meta-icon"
                          src={ICONS.Distance}
                          alt=""
                          aria-hidden="true"
                        />
                        {r.course_distance}km
                      </span>
                    </div>
                  </div>

                  {/* 오른쪽 위 ... 버튼 */}
                  <button
                    type="button"
                    className="reviewmy-more-btn"
                    aria-label="옵션"
                    onClick={(e) => handleMoreClick(e, r.review_id)}
                  >
                    <img src={ICONS.Setting} alt="" aria-hidden="true" />
                  </button>
                </div>

                {/* 썸네일과 날짜 사이의 구분선 */}
                <div className="reviewmy-item-sep" />

                {/* 날짜 + 별점 */}
                <div className="reviewmy-date-stars">
                  <p className="reviewmy-date">{r.review_date}</p>
                  <Stars value={r.rating} />
                </div>

                {/* 내용 */}
                <p className="reviewmy-content-text">{r.content}</p>

                {/* 점 3개 눌렀을 때 나오는 "리뷰 삭제" 바 */}
                {openedMenuId === r.review_id && (
                  <button
                    type="button"
                    className="reviewmy-delete-inline"
                    onClick={(e) => handleDeleteClick(e, r)}
                  >
                    리뷰 삭제
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>

      {/* 삭제 확인 모달 */}
      {showConfirm && (
        <div className="reviewmy-modal-backdrop" onClick={handleConfirmCancel}>
          <div className="reviewmy-modal" onClick={(e) => e.stopPropagation()}>
            <p className="reviewmy-modal-text">리뷰를 삭제하시겠습니까?</p>
            <div className="reviewmy-modal-actions">
              <button
                type="button"
                className="reviewmy-modal-btn reviewmy-modal-btn-confirm"
                onClick={handleConfirmOk}
              >
                예
              </button>
              <button
                type="button"
                className="reviewmy-modal-btn reviewmy-modal-btn-cancel"
                onClick={handleConfirmCancel}
              >
                아니요
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewMy;
