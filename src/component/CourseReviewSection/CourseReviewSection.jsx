// src/components/CourseReviewSection/CourseReviewSection.jsx
import React from 'react';
import './CourseReviewSection.css'; 


const ReviewItem = ({ review, ASSET_ICONS }) => {
    const renderStars = (rating) => {
        const stars = [];
        for (let i = 0; i < 5; i++) {
            const isFilled = i < Math.floor(rating);
            const src = isFilled ? ASSET_ICONS.star_on : ASSET_ICONS.star_off; 
            stars.push(
                <img key={i} src={src} alt="별점" className="c-detail-review-star-icon" />
            );
        }
        return <div className="c-detail-review-stars">{stars}</div>;
    };
    
    return (
        <div className="c-detail-review-item">
            {/* 1. 날짜 (Absolute 위치 기준) */}
            <span className="c-detail-review-date">{review.created_at}</span> 
            
            {/* 2. 프로필, 닉네임, 별점 영역 */}
            <div className="c-detail-review-profile-line">
                <img src={review.profileImage} alt={review.name} className="c-detail-user-profile-img" />
                
                {/* 닉네임과 별점 묶음 */}
                <div className="c-detail-user-text">
                    <span className="c-detail-user-nickname">{review.name}</span>
                    {renderStars(review.star)}
                </div>
            </div>

            {/* 3. 리뷰 내용 */}
            <p className="c-detail-review-content">{review.content}</p>
        </div>
    );
};


const CourseReviewSection = ({ reviewData, onReviewViewAll, ASSET_ICONS, maxItems = 3 }) => {
    if (!reviewData || !reviewData.reviews) return null;
    
    const reviewsToShow = reviewData.reviews.slice(0, maxItems);

    return (
        <div className="c-detail-review-section">
            {/* 1. 리뷰 제목/전체보기 줄 */}
            <div className="c-detail-review-title-row">
                <h2 className="c-detail-review-title">코스 리뷰</h2>
            </div>
            
            {/* 2. 평점 요약 */}
            <p className="c-detail-review-summary">
                <img src={ASSET_ICONS.avg_star} alt="평점별" className="c-detail-avg-star-icon" />
                <span className="c-detail-review-score-text">{(reviewData.starAverage || 0).toFixed(2)}</span>
                <span className="c-detail-review-count-text">({reviewData.reviewCount})</span>
            </p>

            {/* 3. 리뷰 목록 */}
            <div className="c-detail-reviews-list">
                {reviewsToShow.map(review => (
                   
                    <ReviewItem key={review.reviewid} review={review} ASSET_ICONS={ASSET_ICONS} />
                ))}
            </div>
        </div>
    );
};

export default CourseReviewSection;