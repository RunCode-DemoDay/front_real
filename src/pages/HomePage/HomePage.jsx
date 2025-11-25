// src/pages/HomePage/HomePage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import BottomNavigator from "../../component/BottomNavigator/BottomNavigator";
import CourseItem from "../../component/CourseItem/CourseItem";
import CustomSelect from "../../component/CustomSelect/CustomSelect";
import "./HomePage.css";

import { getTypesWithTags, getCoursesByTag } from "../../api/homeAPI";
import { getMyInfo } from "../../api/userAPI"; 

const SEARCH_ICON_SRC =
  "https://runcode-likelion.s3.us-east-2.amazonaws.com/global/search.svg";

const ORDER_OPTIONS = [
  { label: "최신순", value: "최신순" },
  { label: "리뷰순", value: "리뷰순" },
  { label: "별점순", value: "별점순" },
  { label: "짧은코스순", value: "짧은코스순" },
  { label: "긴코스순", value: "긴코스순" },
];


const normalizeTypesResponse = (raw) => {
  if (!raw) return null;
  return {
    typeId: raw.type_id,
    name: raw.name,
    description: raw.description,
    thumbnailUrl: raw.thumbnail,
    tags: Array.isArray(raw.tags)
      ? raw.tags.map((t) => ({ id: t.tag_id, name: t.name }))
      : [],
  };
};

function HomePage() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  const [tags, setTags] = useState([]); 
  const [courses, setCourses] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(ORDER_OPTIONS[0].value);
  const [loading, setLoading] = useState(true);
  const [mvpTypeName, setMvpTypeName] = useState(null); 

  
  const [myName, setMyName] = useState(null);

 
  const baseNameFromAuth = userProfile?.name || userProfile?.nickname || null;

 
  const userName = myName || baseNameFromAuth || "러너";

 
  const fallbackRunType =
    typeof userProfile?.type === "string"
      ? userProfile.type
      : userProfile?.type?.name || "유형 미등록";

  
  useEffect(() => {
    const loadMyInfo = async () => {
      try {
        const res = await getMyInfo(); 
        if (!res || !res.success || !res.data) {
          console.warn("/users/me 응답 이상:", res);
          return;
        }

        const raw = res.data;
       
        const displayName = raw.nickname || raw.name || raw.username || "러너";

        setMyName(displayName);
      } catch (err) {
        console.error("/users/me 호출 에러 (HomePage):", err);
      }
    };

    loadMyInfo();
  }, []);

 
  useEffect(() => {
    const loadTypes = async () => {
      try {
        const res = await getTypesWithTags();
        
        if (!res || !res.success || !res.data) {
          console.warn("/types 응답 이상:", res);
          return;
        }

        const normalized = normalizeTypesResponse(res.data);
        if (!normalized) {
          console.warn("/types 정규화 실패:", res);
          return;
        }

       
        setMvpTypeName(normalized.name || null);
        setTags(normalized.tags);

        
        if (normalized.tags.length > 0) {
          setSelectedTag(normalized.tags[0].name); // 우리는 이름으로 /courses 조회
        }
      } catch (err) {
        console.error("/types 호출 에러:", err);
      }
    };
    loadTypes();
  }, []);


  const loadCourses = useCallback(async (tag, order) => {
    if (!tag) return;
    setLoading(true);
    try {
      const res = await getCoursesByTag({ tag, order });
      if (res && res.success) {
        setCourses(Array.isArray(res.data) ? res.data : []);
      } else {
        setCourses([]);
      }
    } catch (err) {
      console.error("코스 로드 실패:", err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedTag && selectedOrder) {
      loadCourses(selectedTag, selectedOrder);
    }
  }, [selectedTag, selectedOrder, loadCourses]);

  const handleSelectChange = (newValue) => {
    setSelectedOrder(newValue);
  };

  return (
    <div className="home-page-container">
      <div className="search-icon-container">
        <div className="search-icon" onClick={() => navigate("/search")}>
          <img src={SEARCH_ICON_SRC} alt="검색" />
        </div>
      </div>

      <header className="home-header">
        <h1 className="greeting">
          <span className="user-name">{userName}님,</span>
          <br />
          오늘도 힘차게 달려볼까요?
        </h1>
      </header>

      <section className="filter-section">
        <div className="mvp-type-info">
          <span className="label-mvp">나의 러너 유형</span>
          <span className="type-name">{mvpTypeName || fallbackRunType}</span>
        </div>

        <div className="tag-buttons-container">
          {tags.map((tag) => (
            <button
              key={tag.id}
              className={`tag-button ${
                selectedTag === tag.name ? "active" : ""
              }`}
              onClick={() => setSelectedTag(tag.name)}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </section>
      <div className="ffilter-sort-bar">
          <CustomSelect
            options={ORDER_OPTIONS}
            value={selectedOrder}
            onChange={handleSelectChange}
          />
        </div>

      <main className="course-main-content">
        

        <div className="course-list">
          {loading ? (
            <p className="loading-message">코스 목록을 불러오는 중입니다...</p>
          ) : courses.length > 0 ? (
            courses.map((course) => (
              <CourseItem key={course.course_id ?? course.id} course={course} />
            ))
          ) : (
            <p className="no-course-message">
              현재 조건에 맞는 코스가 없습니다.
            </p>
          )}
        </div>
      </main>

      <BottomNavigator />
    </div>
  );
}

export default HomePage;
