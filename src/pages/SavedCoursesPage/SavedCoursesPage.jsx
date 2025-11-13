// src/pages/SavedCoursesPage/SavedCoursesPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import BottomNavigator from '../../component/BottomNavigator/BottomNavigator'; 
import CourseItem from '../../component/CourseItem/CourseItem'; 
import './SavedCoursesPage.css';
import { useNavigate } from 'react-router-dom';
import CustomSelect from '../../component/CustomSelect/CustomSelect';

// ⭐ Mock API import (fetchBookmarks 함수)
import { fetchBookmarks } from '../../api/mockBookmarkAPI'; 

// 드롭다운 아이콘 (HomePage/SearchPage에서 사용된 아이콘 재사용)
const DROPDOWN_ARROW_SRC = 'https://runcode-likelion.s3.us-east-2.amazonaws.com/global/dropdown.svg'; 

// 정렬 옵션 정의
const ORDER_OPTIONS = [
    { label: "최신 순", value: "LATEST" }, 
    { label: "짧은 순", value: "DISTANCE_ASC" },
    { label: "별점 순", value: "RATING_DESC" },
];

// ⭐ 스켈레톤 컴포넌트 (CourseItem과 유사한 형태로 정의)
const SkeletonCourseItem = () => (
    <div className="skeleton-item-card">
        <div className="skeleton-thumbnail"></div>
        <div className="skeleton-details">
            <div className="skeleton-line full-width"></div>
            <div className="skeleton-line medium-width"></div>
            <div className="skeleton-line short-width"></div>
        </div>
    </div>
);
// =========================================================


function SavedCoursesPage() {
    const navigate = useNavigate();
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(ORDER_OPTIONS[0].value); 

    // 북마크 목록 조회 함수 (정렬 조건 변경 시 재호출)
    const loadBookmarks = useCallback(async (order) => {
        setLoading(true);
        try {
            const apiData = await fetchBookmarks(order); 
            
            // ⭐ 핵심 수정: API 데이터 형태 변환 (distance: number -> string)
            const formattedBookmarks = apiData.map(item => ({
                // API 명세의 필드를 그대로 사용
                ...item,
                // CourseItem에서 'km'를 붙여주므로, 여기서는 숫자 값만 전달합니다.
                distance: item.distance, 
                // 북마크 목록 조회이므로, is_bookmarked는 항상 true라고 가정
                is_bookmarked: true 
            }));
            
            setBookmarks(formattedBookmarks); 

        } catch (error) {
            console.error("북마크 로드 실패:", error);
            setBookmarks([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Effect: 정렬 조건 변경 시 북마크 목록 재조회
    useEffect(() => {
        loadBookmarks(selectedOrder);
    }, [selectedOrder, loadBookmarks]); 

    const handleOrderChange = (newValue) => {
        setSelectedOrder(newValue);
    };


    return (
        <div className="saved-courses-page-container">
            {/* 1. 상단 타이틀 */}
            <header className="saved-courses-header">
                <h1 className="page-title">저장된 코스</h1>
            </header>

            {/* 2. 코스 목록 및 정렬 */}
            <main className="course-main-content">
                {/* 정렬 드롭다운 */}
                <div className="filter-sort-bar">
                    <CustomSelect
                        options={ORDER_OPTIONS}
                        value={selectedOrder}
                        onChange={handleOrderChange}
                        placeholder="최신 순" // 기본값 (props에 기본값 설정되어 있지만 명시적으로 전달)
                    />
                </div>

                <div className="course-list">
                    {loading ? (
                        // 로딩 중 스켈레톤 UI 표시
                        [1, 2, 3].map(i => <SkeletonCourseItem key={i} />)
                    ) : bookmarks.length > 0 ? (
                        // 북마크 코스 목록 표시
                        bookmarks.map(course => (
                            <CourseItem 
                                key={course.course_id} 
                                course={course} 
                                // isBookmarked 상태는 데이터 변환 시 true로 강제 설정됨
                            />
                        ))
                    ) : (
                        // 결과가 없을 때
                        <p className="no-course-message">저장된 코스가 없습니다.</p>
                    )}
                </div>
            </main>
            
            {/* 3. 하단 네비게이터 */}
            <BottomNavigator initialActiveTab="saved" />
        </div>
    );
}

export default SavedCoursesPage;