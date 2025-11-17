// src/pages/SearchPage/SearchPage.jsx (수정)

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchCourses } from '../../api/courseAPI';
import { fetchCourses } from '../../api/mockHomeAPI'; // Mock API
import BottomNavigator from '../../component/BottomNavigator/BottomNavigator'; 
import CourseItem from '../../component/CourseItem/CourseItem'; 
import './SearchPage.css'; // CSS 파일 import

// ⭐ [추가] CustomSelect 컴포넌트 임포트
import CustomSelect from '../../component/CustomSelect/CustomSelect'; 

// =========================================================
// ⭐ 1. HomePage에서 사용한 ORDER_OPTIONS 재정의
const ORDER_OPTIONS = [
    { label: "최신순", value: "최신순" },
    { label: "짧은코스순", value: "짧은코스순" },
    { label: "긴코스순", value: "긴코스순" },
    { label: "별점순", value: "별점순" },
    { label: "리뷰순", value: "리뷰순" },
];

// ⭐ 2. useDebounce 커스텀 훅 정의
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};

// SVG 아이콘 링크
const SEARCH_ICON_SRC = 'https://runcode-likelion.s3.us-east-2.amazonaws.com/global/search.svg';
const BACK_ICON_SRC = 'https://runcode-likelion.s3.us-east-2.amazonaws.com/global/back.svg';
// =========================================================

// ⭐ 3. 스켈레톤 컴포넌트 정의 (이전 답변 코드와 동일)
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


function SearchPage() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialSearch, setInitialSearch] = useState(true); 
    
    // ⭐ 4. 정렬 상태 추가 (HomePage와 동일)
    const [selectedOrder, setSelectedOrder] = useState(ORDER_OPTIONS[0].value);
    
    // 디바운싱 적용
    const debouncedSearchQuery = useDebounce(searchQuery, 500); 

    // 검색 실행 함수: 정렬 기준(order)을 인자로 받도록 수정
    const handleSearch = useCallback(async (query, order) => {
        if (query.trim() === '') {
            setCourses([]);
            setInitialSearch(true);
            setLoading(false);
            return;
        }

        setLoading(true);
        setInitialSearch(false);
        try {
            // Mock API 호출: tag는 null, order와 query를 전달
            // fetchCourses(tag, order, query) 구조 사용
            console.log("검색어:", query);
            console.log("정렬 기준:", order);
            const result = await searchCourses(query, order); 
            console.log("검색 결과:", result);
            if (result.success && Array.isArray(result.data)) {
                setCourses(result.data); // ✅ 응답 객체의 data 배열을 상태에 저장합니다.
            } else {
                setCourses([]); // 실패하거나 데이터 형식이 맞지 않으면 빈 배열로 초기화합니다.
            }
        } catch (error) {
            console.error("검색 코스 로드 실패:", error);
            setCourses([]);
        } finally {
            setLoading(false);
        }
    }, []); // 의존성 없음

    // ⭐ 5. Effect: 검색어(debounced)와 정렬 기준(selectedOrder) 변경 시 모두 검색 실행
    useEffect(() => {
        // 검색어 변경 or 정렬 기준 변경 시 실행
        if (debouncedSearchQuery || selectedOrder) { 
            handleSearch(debouncedSearchQuery, selectedOrder);
        }
    }, [debouncedSearchQuery, selectedOrder, handleSearch]);


    // 폼 제출 핸들러 (Enter 키 시 즉시 검색)
    const handleSearchSubmit = (e) => {
          e.preventDefault(); 
          // 즉시 검색 시 현재 선택된 정렬 기준을 사용
          handleSearch(searchQuery, selectedOrder);
    };
    
    // ⭐ [추가] CustomSelect의 onChange 핸들러
    const handleOrderChange = (newValue) => {
        setSelectedOrder(newValue);
    };


    return (
        <div className="search-page-container">
            {/* 1. 상단 검색 바 (유지) */}
            <header className="search-header">
                <button className="back-button" onClick={() => navigate(-1)}>
                    <img src={BACK_ICON_SRC} alt="뒤로가기" style={{ width: '20px', height: '20px' }}/>
                </button> 
                
                <form onSubmit={handleSearchSubmit} className="search-form">
                    <input
                        type="search"
                        placeholder="검색어를 입력해주세요."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                        autoFocus
                    />
                    <button type="submit" className="search-button">
                        <img src={SEARCH_ICON_SRC} alt="검색" style={{ width: '20px', height: '20px' }}/>
                    </button>
                </form>
            </header>

            {/* 2. 코스 목록 및 상태 메시지 */}
            <main className="search-results-main">
                {/* ⭐ 6. 정렬 드롭다운 (CustomSelect로 교체) */}
                {!initialSearch && (
                    <div className="filter-sort-bar">
                        <CustomSelect
                            options={ORDER_OPTIONS}
                            value={selectedOrder}
                            onChange={handleOrderChange} // CustomSelect 핸들러 연결
                            placeholder="최신 순"
                        />
                        
                    </div>
                )}
                
                {loading && !initialSearch ? (
                    // 로딩 중 (스켈레톤 UI)
                    <div className="course-list">
                        {[1, 2, 3, 4].map(i => <SkeletonCourseItem key={i} />)}
                    </div>
                ) : initialSearch ? (
                    // 초기 검색 상태
                    <p className="placeholder-message"></p> 
                ) : courses.length > 0 ? (
                    // 검색 결과 있음
                    <div className="course-list">
                        {courses.map(course => (
                            <CourseItem key={course.course_id} course={course} />
                        ))}
                    </div>
                ) : (
                    // 검색 결과 없음
                    <p className="no-results-message">검색 결과가 없습니다.</p>
                )}
            </main>

            {/* 3. 하단 네비게이터 */}
            <BottomNavigator />
        </div>
    );
}

export default SearchPage;