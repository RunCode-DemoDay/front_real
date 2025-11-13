import React from "react";
import { useNavigate } from "react-router-dom";

import StarIcon from "../../assets/Star.svg";
import DistanceIcon from "../../assets/Distance.svg";
import ReviewsIcon from "../../assets/Reviews.svg";
import SettingIcon from "../../assets/Setting.svg";

const LeftArrow = 'https://runcode-likelion.s3.us-east-2.amazonaws.com/global/back.svg'

import "./ReviewMy.css";

// 📍 더미데이터
import { mockMyWrittenReviews as DATA } from "../../api/mockMyPageAPI";

// ⭐ rating 만큼 색칠되는 별
const Stars = ({ value }) => {
  const filled = Math.max(0, Math.min(5, Math.floor(Number(value) || 0)));
  const empty = 5 - filled;
  return (
    <div className="reviewmy-stars" aria-label={`별점 ${filled}점`}>
      {Array.from({ length: filled }).map((_, i) => (
        <span key={`f-${i}`} className="star filled">★</span>
      ))}
      {Array.from({ length: empty }).map((_, i) => (
        <span key={`e-${i}`} className="star empty">★</span>
      ))}
    </div>
  );
};

const ReviewMy = () => {
  const navigate = useNavigate();
  const handleBack = () => navigate(-1);

  return (
    <div className="reviewmy-page">
      {/* 헤더 */}
      <header className="reviewmy-header">
        <button type="button" className="reviewmy-back-btn" onClick={handleBack}>
          <img className="reviewmy-back-icon" src={LeftArrow} alt="뒤로가기" />
        </button>

        <div className="reviewmy-title-row">
          <h2 className="reviewmy-title">작성한 리뷰</h2>
          <span className="reviewmy-count">({DATA.length})</span>
        </div>
      </header>

      {/* 본문 */}
      <main className="reviewmy-content">
        <ul className="reviewmy-list">
          {DATA.map((r) => (
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
                      <img className="reviewmy-meta-icon" src={StarIcon} alt="" aria-hidden="true" />
                      {r.course_star_average}
                    </span>
                    <span>
                      <img className="reviewmy-meta-icon" src={ReviewsIcon} alt="" aria-hidden="true" />
                      리뷰 {r.course_review_count}건
                    </span>
                    <span>
                      <img className="reviewmy-meta-icon" src={DistanceIcon} alt="" aria-hidden="true" />
                      {r.course_distance}km
                    </span>
                  </div>
                </div>

                {/* 오른쪽 위 ... 버튼 */}
                <button type="button" className="reviewmy-more-btn" aria-label="옵션">
                  <img src={SettingIcon} alt="" aria-hidden="true" />
                </button>
              </div>

              {/* 썸네일과 날짜 사이의 구분선 */}
              <div className="reviewmy-item-sep" />

              {/* 날짜 + 별점 (한 줄로 붙임) */}
              <div className="reviewmy-date-stars">
                <p className="reviewmy-date">{r.review_date}</p>
                <Stars value={r.rating} />
              </div>

              {/* 내용 */}
              <p className="reviewmy-content-text">{r.content}</p>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
};

export default ReviewMy;
