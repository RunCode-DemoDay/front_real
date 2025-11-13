import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockUnreviewedCourses } from "../../api/mockMyPageAPI";
import CourseItem from "../../component/CourseItem/CourseItem";

import "./ReviewAdd.css";

const LeftArrow = 'https://runcode-likelion.s3.us-east-2.amazonaws.com/global/back.svg'

const ReviewAdd = () => {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setCourses(mockUnreviewedCourses);
  }, []);

  // ✅ 뒤로가기: 항상 마이페이지로
  const handleGoBack = () => {
    navigate("/mypage");
  };

  // ✅ 코스 클릭 시 ReviewStar로 이동하면서 해당 코스 데이터(state) 같이 넘기기
  const handleCourseClick = (course) => {
    navigate(`/reviewstar/${course.course_id}`, {
      state: { course },
    });
  };

  return (
    <div className="reviewadd-page">
      {/* 상단 헤더 */}
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

      {/* 본문 */}
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
                {/* ⭐ CourseItem에 직접 onClick을 넘겨준다 */}
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
