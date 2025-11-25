// src/component/CourseItem/CourseItem.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { createBookmark, deleteBookmark } from '../../api/bookmarkAPI'; 
import './CourseItem.css'; 

const META_ICONS = {
  star: 'https://runcode-likelion.s3.us-east-2.amazonaws.com/course/star.svg',
  comment: 'https://runcode-likelion.s3.us-east-2.amazonaws.com/course/review.svg',
  location: 'https://runcode-likelion.s3.us-east-2.amazonaws.com/course/distance.svg',
  bookmark_on: 'https://runcode-likelion.s3.us-east-2.amazonaws.com/course/save_on.svg', 
  bookmark_off: 'https://runcode-likelion.s3.us-east-2.amazonaws.com/course/save_off.svg', 
};


const DEFAULT_THUMBNAIL = '/course_img.jpg';


const CourseItem = ({ course, onClick, onBookmarkChange }) => {
  const navigate = useNavigate();


  const [isBookmarked, setIsBookmarked] = useState(course._bookmarked !== undefined ? course._bookmarked : true); 
  const [bookmarkId, setBookmarkId] = useState(course.bookmark_id); 

  const iconStyle = { 
    width: '16px', 
    height: '16px', 
    verticalAlign: 'middle', 
    marginRight: '4px' 
  };
    
  const handleBookmarkToggle = async (e) => {
    e.stopPropagation(); // 카드 전체 클릭 막기
        
    const originalBookmarkStatus = isBookmarked;
    const originalBookmarkId = bookmarkId;    

    
    setIsBookmarked(!originalBookmarkStatus);
    if (!originalBookmarkStatus) {
     
      setBookmarkId(-1); 
    } else {
      // 북마크 삭제 시
      setBookmarkId(null);
    }

    try {
      
      if (!originalBookmarkStatus) {
       
        console.log(
          `[북마크 생성 요청] course_id: ${course.course_id}, 타입: ${typeof course.course_id}`
        );
        const result = await createBookmark(course.course_id);
        console.log("북마크 생성 결과:", result);
        if (result.success) {
          setBookmarkId(result.data.bookmark_id); // 성공 시, 실제 ID로 업데이트
        } else {
          throw new Error(result.message || "북마크 생성에 실패했습니다.");
        }
      } else {
        // 북마크 삭제 API 호출
        console.log(`북마크 삭제 요청 : course_id : ${course.course_id||course.courseId}`)
        await deleteBookmark(course.course_id||course.courseId);
        
        if (onBookmarkChange) {
          
          onBookmarkChange(course.course_id || course.courseId);
        }
        console.log("북마크 삭제 성공");
      }
    } catch (error) {
      console.error("북마크 토글 에러:", error);
      alert("북마크 처리 중 에러가 발생했습니다.");
      
      setIsBookmarked(originalBookmarkStatus);
      setBookmarkId(originalBookmarkId);
    }
  };
    
 
  const handleCourseClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/course/${course.course_id||course.courseId}`);
    }
  };
    
  const bookmarkIconSrc = isBookmarked
    ? META_ICONS.bookmark_on
    : META_ICONS.bookmark_off;

  
  const thumbnailSrc = (course.thumbnail && !course.thumbnail.includes('/public/')) ? course.thumbnail : DEFAULT_THUMBNAIL;

  return (
    <div className="course-item-card" onClick={handleCourseClick}>
      <div className="thumbnail-placeholder">
        <img
          src={thumbnailSrc}
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
            {(course.star_average || course.starAverage || 0).toFixed(2)}
          </span>
                    
          <span className="review-count">
            <img src={META_ICONS.comment} alt="리뷰" style={iconStyle} />
            리뷰 {course.review_count|course.reviewCount}건
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
