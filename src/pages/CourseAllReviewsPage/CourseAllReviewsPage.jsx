// src/pages/CourseAllReviewsPage/CourseAllReviewsPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCourseReviews } from '../../api/mockCourseDetailAPI'; 
import { getCourseReviews } from '../../api/courseDetailAPI';
import AppContainer from '../../AppContainer/AppContainer';
import CourseReviewSection from '../../component/CourseReviewSection/CourseReviewSection';
import './CourseAllReviewsPage.css'; // ⭐ 이 페이지 전용 CSS import

// CourseDetailPage에서 사용하던 ASSET_ICONS 재정의 (혹은 별도 파일로 분리된 것을 import)
const ASSET_ICONS = {
    back: 'https://runcode-likelion.s3.us-east-2.amazonaws.com/global/back.svg',
    avg_star: 'https://runcode-likelion.s3.us-east-2.amazonaws.com/course/detail/avg_star.svg',
    star_on: 'https://runcode-likelion.s3.us-east-2.amazonaws.com/course/detail/star_on.svg',
    star_off: 'https://runcode-likelion.s3.us-east-2.amazonaws.com/course/detail/star_off.svg', 
    right_arrow: 'https://runcode-likelion.s3.us-east-2.amazonaws.com/course/detail/right_arrow.svg',
};

function CourseAllReviewsPage() {
    const urlParams = useParams(); 
    const navigate = useNavigate();
    const courseId = urlParams.courseId || '1'; 

    const [reviewData, setReviewData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1. 데이터 로딩 (리뷰만 가져옴)
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            try {
                const reviewRes = await getCourseReviews({courseId, order : 'latest'});
                setReviewData(reviewRes);
                console.log("리뷰 로드 완료:", reviewRes);
            } catch (err) {
                console.error("리뷰 로드 실패:", err);
                setError("리뷰 정보를 불러오는 데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [courseId]);

    const handleBack = useCallback(() => {
        // 뒤로가기 버튼: 이전 페이지(CourseDetailPage)로 이동
        navigate(-1);
    }, [navigate]);


    // 2. 로딩 및 에러 처리 (AppContainer 내부에서 렌더링)
    if (loading || error || !reviewData) { 
        return (
            <AppContainer>
                <div className="all-reviews-loading-screen">
                    {loading ? "리뷰 로딩 중..." : `오류: ${error || "리뷰 정보 없음"}`}
                </div>
            </AppContainer>
        );
    }

    const totalReviews = reviewData.data.reviewCount; 
    console.log("전체 리뷰 수:", totalReviews);

    // 3. JSX 렌더링
    return (
        <AppContainer>
            <div className="all-reviews-container">
                
                {/* ⭐ 1. 뒤로가기 버튼 및 제목 (Header) */}
                <div className="all-reviews-top-bar"> 
                    <button className="all-reviews-back-button" onClick={handleBack}>
                        <img src={ASSET_ICONS.back} alt="뒤로가기" className="c-detail-back-icon"/> {/* c-detail-back-icon 재사용 */}
                    </button>
                </div>

                {/* ⭐ 2. 스크롤 가능한 리뷰 영역 */}
                <div className="all-reviews-scroll-wrapper">
                    
                    {/* CourseReviewSection 컴포넌트 재사용 */}
                    <CourseReviewSection 
                        reviewData={reviewData.data} 
                        // 전체보기 페이지에서는 이 버튼을 숨겨야 하므로 null을 전달
                        onReviewViewAll={null} 
                        ASSET_ICONS={ASSET_ICONS}
                        maxItems={totalReviews} // ⭐ 모든 리뷰를 표시하도록 전체 길이 전달
                        isFullPage={true} 
                    />
                    
                </div>
            </div>
        </AppContainer>
    );
}

export default CourseAllReviewsPage;