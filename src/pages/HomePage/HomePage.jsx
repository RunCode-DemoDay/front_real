// src/pages/HomePage/HomePage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import BottomNavigator from "../../component/BottomNavigator/BottomNavigator";
import CourseItem from "../../component/CourseItem/CourseItem";
import CustomSelect from "../../component/CustomSelect/CustomSelect";
import "./HomePage.css";

import { getTypesWithTags, getCoursesByTag } from "../../api/homeAPI";
import { getMyInfo } from "../../api/userAPI"; // ✅ 추가: /users/me 호출

const SEARCH_ICON_SRC =
  "https://runcode-likelion.s3.us-east-2.amazonaws.com/global/search.svg";

const ORDER_OPTIONS = [
  { label: "최신순", value: "최신순" },
  { label: "리뷰순", value: "리뷰순" },
  { label: "별점순", value: "별점순" },
  { label: "짧은코스순", value: "짧은코스순" },
  { label: "긴코스순", value: "긴코스순" },
];

/** 서버 /types 응답 → 프론트에서 쓰기 좋은 형태로 정규화 */
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

  const [tags, setTags] = useState([]); // [{id, name}]
  const [courses, setCourses] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(ORDER_OPTIONS[0].value);
  const [loading, setLoading] = useState(true);
  const [mvpTypeName, setMvpTypeName] = useState(null); // 상단 “오늘의 MVP 유형” 표시용

  // ✅ /users/me에서 가져온 이름(닉네임 우선) 로컬 상태
  const [myName, setMyName] = useState(null);

  // 🔧 AuthContext에 이미 올라가 있는 이름 (있으면 사용)
  const baseNameFromAuth = userProfile?.name || userProfile?.nickname || null;

  // 🔧 최종적으로 화면에 보여줄 이름:
  // 1순위: /users/me에서 가져온 myName
  // 2순위: AuthContext에 있는 이름
  // 3순위: "러너"
  const userName = myName || baseNameFromAuth || "러너";

  // 🔧 백에서 type을 "문자열"로 줄 수도 있고, { name } 객체로 줄 수도 있으니 둘 다 처리
  const fallbackRunType =
    typeof userProfile?.type === "string"
      ? userProfile.type
      : userProfile?.type?.name || "유형 미등록";

  /** 0) 새로고침 시 /users/me로 내 정보 가져오기 (닉네임 포함) */
  useEffect(() => {
    const loadMyInfo = async () => {
      try {
        const res = await getMyInfo(); // { success, code, message, data }
        if (!res || !res.success || !res.data) {
          console.warn("/users/me 응답 이상:", res);
          return;
        }

        const raw = res.data;
        // ✅ 닉네임이 있으면 닉네임 우선, 없으면 카카오 name 사용
        const displayName = raw.nickname || raw.name || raw.username || "러너";

        setMyName(displayName);
      } catch (err) {
        console.error("/users/me 호출 에러 (HomePage):", err);
      }
    };

    loadMyInfo();
  }, []);

  /** 1) /types 호출해서 태그/유형 로딩 */
  useEffect(() => {
    const loadTypes = async () => {
      try {
        const res = await getTypesWithTags();
        // 예상 형식: { success, code, message, data }
        if (!res || !res.success || !res.data) {
          console.warn("/types 응답 이상:", res);
          return;
        }

        const normalized = normalizeTypesResponse(res.data);
        if (!normalized) {
          console.warn("/types 정규화 실패:", res);
          return;
        }

        // 상단 유형명 & 태그 세팅
        setMvpTypeName(normalized.name || null);
        setTags(normalized.tags);

        // 첫 태그 자동 선택
        if (normalized.tags.length > 0) {
          setSelectedTag(normalized.tags[0].name); // 우리는 이름으로 /courses 조회
        }
      } catch (err) {
        console.error("/types 호출 에러:", err);
      }
    };
    loadTypes();
  }, []);

  /** 2) 태그/정렬 변경 시 코스 조회 */
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

      <main className="course-main-content">
        <div className="filter-sort-bar">
          <CustomSelect
            options={ORDER_OPTIONS}
            value={selectedOrder}
            onChange={handleSelectChange}
          />
        </div>

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
