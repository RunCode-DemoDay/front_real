// src/pages/ReviewStar/ReviewStar.jsx
import React, { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";

import StarIcon from "../../assets/Star.svg";
import ReviewsIcon from "../../assets/Reviews.svg";
import DistanceIcon from "../../assets/Distance.svg";
import BigStarIcon from "../../assets/ReviewStar.svg";

import "./ReviewStar.css";

const LeftArrow = 'https://runcode-likelion.s3.us-east-2.amazonaws.com/global/back.svg'

const ReviewStar = () => {
  const { courseId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();


  const course = state?.course || {
    title: "한강 반포 러닝 코스",
    thumbnail: "",
    star_average: 4.9,
    review_count: 120,
    distance: 5.2,
  };

  const [rating, setRating] = useState(0); 
  const [content, setContent] = useState(""); 
  const [showModal, setShowModal] = useState(false); 

  
  const handleGoBack = () => {
    navigate("/reviewadd");
  };


  const handleRating = (value) => {
    setRating(value);
  };

  // 등록하기 클릭
  const handleSubmit = () => {
    if (rating === 0) return; 

   
    console.log("리뷰 등록", {
      courseId,
      rating,
      content,
    });

    
    setShowModal(true);
  };

  
  const handleConfirmModal = () => {
    setShowModal(false);
    navigate("/mypage");
  };

  return (
    <>
      <div className="reviewstar-page">
        
        <header className="reviewstar-header">
          <button className="reviewstar-back-btn" onClick={handleGoBack}>
            <img
              src={LeftArrow}
              alt="뒤로가기"
              className="reviewstar-back-icon"
            />
          </button>

          <h2 className="reviewstar-title">리뷰 작성</h2>
        </header>

     
        <section className="reviewstar-coursebox">
        
          <div className="reviewstar-course-thumb">
            {course.thumbnail ? (
              <img src={course.thumbnail} alt={course.title} />
            ) : (
              <div className="reviewstar-thumb-fallback" />
            )}
          </div>

       
          <div className="reviewstar-course-info">
            <p className="reviewstar-course-title">{course.title}</p>

            <div className="reviewstar-meta">
              <span>
                <img
                  src={StarIcon}
                  alt="평점"
                  className="reviewstar-meta-icon"
                />
                {course.star_average.toFixed(2)}
              </span>

              <span>
                <img
                  src={ReviewsIcon}
                  alt="리뷰 수"
                  className="reviewstar-meta-icon"
                />
                리뷰 {course.review_count}건
              </span>

              <span>
                <img
                  src={DistanceIcon}
                  alt="거리"
                  className="reviewstar-meta-icon"
                />
                {course.distance}km
              </span>
            </div>
          </div>
        </section>

        
        <div className="reviewstar-separator" />

        
        <section className="reviewstar-rating-block">
          <div className="reviewstar-stars">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                className={`reviewstar-star-btn ${
                  num <= rating ? "active" : ""
                }`}
                onClick={() => handleRating(num)}
                aria-label={`${num}점`}
              >
                <img
                  src={BigStarIcon}
                  alt={`${num}점`}
                  className={`reviewstar-bigstar ${
                    num <= rating ? "on" : "off"
                  }`}
                />
              </button>
            ))}
          </div>
        </section>

        
        <section className="reviewstar-input-wrapper">
          <div className="reviewstar-input-block">
            <textarea
              className="reviewstar-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="코스 이용 후기를 남겨주세요."
              maxLength={500}
            />
          </div>

          <div className="reviewstar-count">{content.length} / 500자</div>
        </section>

        
        <button
          className={`reviewstar-submit ${rating > 0 ? "active" : ""}`}
          onClick={handleSubmit}
          disabled={rating === 0}
        >
          등록하기
        </button>
      </div>

      
      {showModal && (
        <div className="reviewstar-modal-overlay">
          <div className="reviewstar-modal-card">
            <p className="reviewstar-modal-text">
              리뷰 작성이 완료되었습니다.
            </p>

            
            <div className="reviewstar-modal-separator" />

            <button
              className="reviewstar-modal-confirm"
              onClick={handleConfirmModal}
            >
              확인
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ReviewStar;
