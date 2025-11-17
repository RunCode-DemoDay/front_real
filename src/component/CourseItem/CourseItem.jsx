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

// ✅ 기본 썸네일 이미지 경로. /public 폴더의 파일은 최상위 경로로 접근합니다.
const DEFAULT_THUMBNAIL = '/course_img.jpg';

// ⭐ onClick을 부모에서 주입받을 수 있게 추가
const CourseItem = ({ course, onClick, onBookmarkChange }) => {
  const navigate = useNavigate();

  // SavedCoursesPage에서는 항상 북마크된 상태로 시작하므로 true로 초기화하거나,
  // 다양한 페이지에서의 재사용을 고려하여 prop을 확인합니다.
  // 여기서는 useEffect를 제거하고, 초기 상태만 설정합니다.
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

    // 1. UI를 먼저 업데이트 (낙관적 업데이트)
    setIsBookmarked(!originalBookmarkStatus);
    if (!originalBookmarkStatus) {
      // 북마크 생성 시, 임시 ID를 설정하여 삭제 요청을 방지
      setBookmarkId(-1); 
    } else {
      // 북마크 삭제 시
      setBookmarkId(null);
    }

    try {
      // 2. API 요청
      if (!originalBookmarkStatus) {
        // 북마크 생성 API 호출
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
        // ⭐ 북마크 변경 콜백 호출
        if (onBookmarkChange) {
          // 삭제된 코스의 ID를 부모에게 전달
          onBookmarkChange(course.course_id || course.courseId);
        }
        console.log("북마크 삭제 성공");
      }
    } catch (error) {
      console.error("북마크 토글 에러:", error);
      alert("북마크 처리 중 에러가 발생했습니다.");
      // 3. API 요청 실패 시, UI 상태를 원래대로 롤백
      setIsBookmarked(originalBookmarkStatus);
      setBookmarkId(originalBookmarkId);
    }
  };
    
  // ⭐ 카드 전체 클릭 동작
  // 1순위: 부모가 준 onClick() (ex. reviewstar 이동)
  // 2순위: 기본 동작(코스 상세로 이동)
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

  // ✅ course.thumbnail이 없거나 잘못된 경로일 경우 기본 이미지로 대체합니다.
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
            {course.star_average||course.starAverage}
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
