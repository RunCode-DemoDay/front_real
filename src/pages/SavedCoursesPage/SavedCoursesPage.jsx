// src/pages/SavedCoursesPage/SavedCoursesPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import BottomNavigator from '../../component/BottomNavigator/BottomNavigator'; 
import CourseItem from '../../component/CourseItem/CourseItem'; 
import './SavedCoursesPage.css';
import { useNavigate } from 'react-router-dom';
import CustomSelect from '../../component/CustomSelect/CustomSelect';


import { getBookmarks } from '../../api/bookmarkAPI'; 


const DROPDOWN_ARROW_SRC = 'https://runcode-likelion.s3.us-east-2.amazonaws.com/global/dropdown.svg'; 


const ORDER_OPTIONS = [
    { label: "최신순", value: "latest" }, 
    { label: "짧은코스순", value: "DISTANCE_ASC" },
    { label: "별점순", value: "RATING_DESC" },
];


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



function SavedCoursesPage() {
    const navigate = useNavigate();
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(ORDER_OPTIONS[0].value); 

    
    const loadBookmarks = useCallback(async (order) => {
        setLoading(true);
        try {
          
            const result = await getBookmarks(order); 
            
            if (result.success) {
              
                setBookmarks(result.data);
            } else {
                throw new Error(result.message || "북마크 목록 조회에 실패했습니다.");
            }

        } catch (error) {
            console.error("북마크 로드 실패:", error);
            alert("저장된 코스를 불러오는 중 오류가 발생했습니다.");
            setBookmarks([]);
        } finally {
            setLoading(false);
        }
    }, []);


    useEffect(() => {
        loadBookmarks(selectedOrder);
    }, [selectedOrder, loadBookmarks]); 

    const handleOrderChange = (newValue) => {
        setSelectedOrder(newValue);
    };

    
    const handleBookmarkChange = () => {
        loadBookmarks(selectedOrder);
    };


    return (
        <div className="saved-courses-page-container">
            
            <header className="saved-courses-header">
                <h1 className="page-title">저장된 코스</h1>
            </header>

            <div className="filter-sort-bar">
                    <CustomSelect
                        options={ORDER_OPTIONS}
                        value={selectedOrder}
                        onChange={handleOrderChange}
                        placeholder="최신순" 
                    />
                </div>

           
            <main className="course-main-content">
                
                

                <div className="course-list">
                    {loading ? (
                       
                        [1, 2, 3].map(i => <SkeletonCourseItem key={i} />)
                    ) : bookmarks.length > 0 ? (
                        
                        bookmarks.map(course => (
                            <CourseItem 
                                key={course.course_id} 
                                course={course} 
                                onBookmarkChange={handleBookmarkChange}
                            />
                        ))
                    ) : (
                       
                        <p className="no-course-message">저장된 코스가 없습니다.</p>
                    )}
                </div>
            </main>
            
            
            <BottomNavigator initialActiveTab="saved" />
        </div>
    );
}

export default SavedCoursesPage;