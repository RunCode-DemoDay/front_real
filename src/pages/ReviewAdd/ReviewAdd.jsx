import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUnreviewedCourses } from "../../api/userAPI";
import CourseItem from "../../component/CourseItem/CourseItem";

import "./ReviewAdd.css";

const LeftArrow = 'https://runcode-likelion.s3.us-east-2.amazonaws.com/global/back.svg'

const ReviewAdd = () => {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
 
    const fetchCourses = async () => {
      try {
        const result = await getUnreviewedCourses();
        if (result.success && Array.isArray(result.data)) {
          setCourses(result.data); 
        }
      } catch (error) {
        console.error("리뷰 미작성 코스 조회 실패:", error);
      }
    };
    fetchCourses();
  }, []);

  
  const handleGoBack = () => {
    navigate("/mypage");
  };

  
  const handleCourseClick = (course) => {
    navigate(`/reviewstar/${course.course_id}`, {
      state: { course },
    });
  };

  return (
    <div className="reviewadd-page">
    
      <header className="reviewadd-header">
        <div className="reviewadd-header-inner">
          <button className="reviewadd-back-btn" onClick={handleGoBack}>
            <img
              src={LeftArrow}
              alt="뒤로가기"
              className="reviewadd-back-icon"
            />
          </button>

          <div className="reviewadd-title-row">
            <h2 className="reviewadd-title">코스 리뷰</h2>
            <span className="reviewadd-count">({courses.length})</span>
          </div>
        </div>
      </header>

    
      <main className="reviewadd-content">
        {courses.length === 0 ? (
          <p className="reviewadd-empty">
            아직 리뷰를 작성할 코스가 없어요.
          </p>
        ) : (
          <ul className="reviewadd-list">
            {courses.map((course) => (
              <li
                key={course.course_id}
                className="reviewadd-listitem"
              >
               
                <CourseItem
                  course={course}
                  onClick={() => handleCourseClick(course)}
                />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};

export default ReviewAdd;
