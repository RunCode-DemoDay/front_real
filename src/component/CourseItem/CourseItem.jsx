// src/component/CourseItem/CourseItem.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { createBookmark, deleteBookmark, MOCK_BOOKMARKS } from '../../api/mockHomeAPI'; 
import './CourseItem.css'; 

const META_ICONS = {
  star: 'https://runcode-likelion.s3.us-east-2.amazonaws.com/course/star.svg',
  comment: 'https://runcode-likelion.s3.us-east-2.amazonaws.com/course/review.svg',
  location: 'https://runcode-likelion.s3.us-east-2.amazonaws.com/course/distance.svg',
  bookmark_on: 'https://runcode-likelion.s3.us-east-2.amazonaws.com/course/save_on.svg', 
  bookmark_off: 'https://runcode-likelion.s3.us-east-2.amazonaws.com/course/save_off.svg', 
};

// ⭐ onClick을 부모에서 주입받을 수 있게 추가
const CourseItem = ({ course, onClick }) => {
  const navigate = useNavigate();
  
  const initialBookmarkId = course.is_bookmarked
    ? MOCK_BOOKMARKS[course.course_id]
    : null;

  const [isBookmarked, setIsBookmarked] = useState(course.is_bookmarked); 
  const [bookmarkId, setBookmarkId] = useState(initialBookmarkId); 
    
  const iconStyle = { 
    width: '16px', 
    height: '16px', 
    verticalAlign: 'middle', 
    marginRight: '4px' 
  };
    
  const handleBookmarkToggle = async (e) => {
    e.stopPropagation(); // 카드 전체 클릭 막기
        
    const nextStatus = !isBookmarked;
    setIsBookmarked(nextStatus); 
        
    try {
      if (isBookmarked) {
        if (bookmarkId) {
          await deleteBookmark(bookmarkId);
          setBookmarkId(null);
        } else {
          throw new Error("저장 ID 없음. 삭제 불가.");
        }
      } else {
        const result = await createBookmark(course.course_id);
        if (result.success) {
          setBookmarkId(result.data.bookmark_id);
        } else {
          throw new Error("북마크 생성 실패");
        }
      }
    } catch (error) {
      console.error("북마크 토글 에러:", error);
      alert("북마크 처리 중 에러가 발생했습니다.");
      setIsBookmarked(!nextStatus); // 롤백
    }
  };
    
  // ⭐ 카드 전체 클릭 동작
  // 1순위: 부모가 준 onClick() (ex. reviewstar 이동)
  // 2순위: 기본 동작(코스 상세로 이동)
  const handleCourseClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/course/${course.course_id}`);
    }
  };
    
  const bookmarkIconSrc = isBookmarked
    ? META_ICONS.bookmark_on
    : META_ICONS.bookmark_off;

  return (
    <div className="course-item-card" onClick={handleCourseClick}>
      <div className="thumbnail-placeholder">
        <img
          src={course.thumbnail}
          alt={course.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
            
      <div className="course-details">
        <button className="bookmark-button" onClick={handleBookmarkToggle}>
          <img src={bookmarkIconSrc} alt="북마크" />
        </button>

        <h3 className="course-title">{course.title}</h3>
        <p className="course-content">{course.content}</p>
                
        <div className="course-meta">
          <span className="star-rating">
            <img src={META_ICONS.star} alt="별점" style={iconStyle} />
            {course.star_average}
          </span>
                    
          <span className="review-count">
            <img src={META_ICONS.comment} alt="리뷰" style={iconStyle} />
            리뷰 {course.review_count}건
          </span>
                    
          <span className="distance">
            <img src={META_ICONS.location} alt="거리" style={iconStyle} />
            {course.distance}km
          </span>
        </div>
      </div>
    </div>
  );
};

export default CourseItem;
