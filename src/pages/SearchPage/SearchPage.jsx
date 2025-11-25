// src/pages/SearchPage/SearchPage.jsx (수정)

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchCourses } from '../../api/courseAPI';
import { fetchCourses } from '../../api/mockHomeAPI'; 
import BottomNavigator from '../../component/BottomNavigator/BottomNavigator'; 
import CourseItem from '../../component/CourseItem/CourseItem'; 
import './SearchPage.css'; 


import CustomSelect from '../../component/CustomSelect/CustomSelect'; 


const ORDER_OPTIONS = [
    { label: "최신순", value: "최신순" },
    { label: "짧은코스순", value: "짧은코스순" },
    { label: "긴코스순", value: "긴코스순" },
    { label: "별점순", value: "별점순" },
    { label: "리뷰순", value: "리뷰순" },
];


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


const SEARCH_ICON_SRC = 'https://runcode-likelion.s3.us-east-2.amazonaws.com/global/search.svg';
const BACK_ICON_SRC = 'https://runcode-likelion.s3.us-east-2.amazonaws.com/global/back.svg';

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
    
   
    const [selectedOrder, setSelectedOrder] = useState(ORDER_OPTIONS[0].value);
    
    
    const debouncedSearchQuery = useDebounce(searchQuery, 500); 

   
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
            
            console.log("검색어:", query);
            console.log("정렬 기준:", order);
            const result = await searchCourses(query, order); 
            console.log("검색 결과:", result);
            if (result.success && Array.isArray(result.data)) {
                setCourses(result.data); 
            } else {
                setCourses([]); 
            }
        } catch (error) {
            console.error("검색 코스 로드 실패:", error);
            setCourses([]);
        } finally {
            setLoading(false);
        }
    }, []); 

    
    useEffect(() => {
        
        if (debouncedSearchQuery || selectedOrder) { 
            handleSearch(debouncedSearchQuery, selectedOrder);
        }
    }, [debouncedSearchQuery, selectedOrder, handleSearch]);


   
    const handleSearchSubmit = (e) => {
          e.preventDefault(); 
          
          handleSearch(searchQuery, selectedOrder);
    };
    
    
    const handleOrderChange = (newValue) => {
        setSelectedOrder(newValue);
    };


    return (
        <div className="search-page-container">
           
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

          
            <main className="search-results-main">
                
                {!initialSearch && (
                    <div className="filter-sort-bar">
                        <CustomSelect
                            options={ORDER_OPTIONS}
                            value={selectedOrder}
                            onChange={handleOrderChange}
                            placeholder="최신 순"
                        />
                        
                    </div>
                )}
                
                {loading && !initialSearch ? (
                    
                    <div className="course-list">
                        {[1, 2, 3, 4].map(i => <SkeletonCourseItem key={i} />)}
                    </div>
                ) : initialSearch ? (
                    
                    <p className="placeholder-message"></p> 
                ) : courses.length > 0 ? (
                    
                    <div className="course-list">
                        {courses.map(course => (
                            <CourseItem key={course.course_id} course={course} />
                        ))}
                    </div>
                ) : (
                   
                    <p className="no-results-message">검색 결과가 없습니다.</p>
                )}
            </main>

            
            <BottomNavigator />
        </div>
    );
}

export default SearchPage;