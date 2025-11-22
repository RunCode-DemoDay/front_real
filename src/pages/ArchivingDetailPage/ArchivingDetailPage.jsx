// src/pages/ArchivingDetailPage/ArchivingDetailPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import AppContainer from "../../AppContainer/AppContainer";
import BottomNavigator from "../../component/BottomNavigator/BottomNavigator";
import CourseItem from "../../component/CourseItem/CourseItem";
import {
  fetchCourseDetail,
  fetchCourseReviews,
} from "../../api/mockCourseDetailAPI";
import {
  fetchArchivingDetail,
  fetchArchivingsByCourse,
  updateArchiving,
  // ❌ updateArchivingImage 제거
} from "../../api/archivingAPI";
import "./ArchivingDetailPage.css";

// 에셋
const ASSET_ICONS = {
  edit: "https://runcode-likelion.s3.us-east-2.amazonaws.com/archiving/edit_icon.svg",
  back: "https://runcode-likelion.s3.us-east-2.amazonaws.com/global/back.svg",
  star: "https://runcode-likelion.s3.us-east-2.amazonaws.com/course/detail/avg_star.svg",
  bookmark:
    "https://runcode-likelion.s3.us-east-2.amazonaws.com/course/review.svg",
  distance:
    "https://runcode-likelion.s3.us-east-2.amazonaws.com/course/detail/distance.svg",
};

// 메모 글자수 제한
const MAX_MEMO_LENGTH = 100;

function ArchivingDetailPage() {
  const { archivingId } = useParams();
  const location = useLocation();
  const locationState = location.state;
  const navigate = useNavigate();

  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const [courseArchivings, setCourseArchivings] = useState([]);
  const [isEditingMemo, setIsEditingMemo] = useState(false);
  const [newContent, setNewContent] = useState("");

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // 1. 아카이빙 상세 정보
        const response = await fetchArchivingDetail(archivingId);
        if (!response.success) throw new Error(response.message);
        let data = response.data;

        // 2. 코스 정보 및 해당 코스의 다른 아카이빙 목록
        if (data.course?.course_id) {
          const courseIdForFetch = data.course.course_id;

          const courseData = await fetchCourseDetail(courseIdForFetch);
          const reviewData = await fetchCourseReviews(courseIdForFetch);
          data.course = {
            ...courseData,
            ...reviewData,
            course_id: courseIdForFetch,
          };

          const archivingsResponse = await fetchArchivingsByCourse(
            courseIdForFetch
          );
          if (archivingsResponse.success) {
            const filteredArchivings = archivingsResponse.data.filter(
              (a) => String(a.archiving_id) !== String(archivingId)
            );
            setCourseArchivings(filteredArchivings);
          }
        }

        if (!data) {
          throw new Error(
            `ID가 '${archivingId}'인 아카이빙 데이터를 찾을 수 없습니다.`
          );
        }

        setDetailData(data);
        setNewTitle(data.title);
        setNewContent((data.content || "").substring(0, MAX_MEMO_LENGTH));
      } catch (error) {
        console.error("아카이빙 상세 정보 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [archivingId, location.pathname, locationState, navigate]);

  // 뒤로가기: 러닝 플로우에서 왔으면 홈으로, 아니면 history back
  const handleBack = useCallback(() => {
    if (locationState?.fromRunning) {
      navigate("/home", { replace: true });
    } else {
      navigate(-1);
    }
  }, [navigate, locationState]);

  // 제목 수정
  const handleTitleUpdate = async () => {
    if (newTitle.trim() === "" || newTitle === detailData.title) {
      setIsEditingTitle(false);
      setNewTitle(detailData.title);
      return;
    }
    try {
      await updateArchiving(archivingId, { title: newTitle });
      setDetailData((prev) => ({ ...prev, title: newTitle }));
    } catch (error) {
      console.error("제목 업데이트 실패:", error);
      alert("제목 수정에 실패했습니다.");
      setNewTitle(detailData.title);
    }
    setIsEditingTitle(false);
  };

  // 메모 수정
  const handleMemoUpdate = async () => {
    const contentToSave = newContent.substring(0, MAX_MEMO_LENGTH);
    try {
      await updateArchiving(archivingId, { content: contentToSave });
      setDetailData((prev) => ({ ...prev, content: contentToSave }));
    } catch (error) {
      console.error("메모 업데이트 실패:", error);
      alert("메모 수정에 실패했습니다.");
    }
    setIsEditingMemo(false);
  };

  if (loading || !detailData) {
    return (
      <AppContainer>
        <div className="detail-loading-screen">상세 정보를 불러오는 중...</div>
      </AppContainer>
    );
  }

  const {
    date,
    title,
    content,
    distance,
    calorie,
    average_pace,
    time,
    altitude,
    cadence,
    detailImage,
    course,
    thumbnail,
  } = detailData;

  const currentMemo = content || "";
  const finalMemoContent = currentMemo.substring(0, MAX_MEMO_LENGTH);
  const memoRowCount = Math.ceil(finalMemoContent.length / 30) || 3;

  const actualLength = newContent.length;
  const displayedLength = Math.min(actualLength, MAX_MEMO_LENGTH);

  const formattedDistance = distance ? distance.toFixed(2) : "0.00";
  const formattedPace = average_pace
    ? average_pace.replace(/"/g, "'")
    : "0'00\"";
  const formattedAltitude = altitude || 0;
  const formattedCadence = cadence || 0;

  return (
    <AppContainer>
      <div className="archiving-detail-container">
        {/* 헤더 */}
        <header className="detail-header">
          <button onClick={handleBack} className="back-button">
            <img src={ASSET_ICONS.back} alt="뒤로가기" className="icon" />
          </button>
        </header>

        {/* 스크롤 영역 */}
        <div className="detail-scroll-area">
          {/* 날짜 + 제목 */}
          <div className="title-section">
            <p className="detail-date">{date}</p>
            <div className="title-edit-area">
              {isEditingTitle ? (
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onBlur={handleTitleUpdate}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleTitleUpdate();
                  }}
                  className="title-input"
                  autoFocus
                />
              ) : (
                <h2 className="detail-title">{title}</h2>
              )}
              <button
                onClick={() => setIsEditingTitle(true)}
                className="edit-button"
              >
                <img src={ASSET_ICONS.edit} alt="수정" className="icon" />
              </button>
            </div>
          </div>

          {/* 기록 정보 (거리/페이스/시간 등) */}
          <div className="run-stats-grid">
            <div className="stat-item">
              <span className="value">{formattedDistance}</span>
              <span className="label">km</span>
            </div>
            <div className="stat-item">
              <span className="value">{formattedPace}</span>
              <span className="label">평균 페이스</span>
            </div>
            <div className="stat-item">
              <span className="value">{time}</span>
              <span className="label">시간</span>
            </div>
            {/* 필요하면 칼로리/고도/케이던스 다시 활성화 */}
            {/* <div className="stat-item">
              <span className="value">{calorie || 0}</span>
              <span className="label">칼로리</span>
            </div>
            <div className="stat-item">
              <span className="value">{formattedAltitude}m</span>
              <span className="label">고도 상승</span>
            </div>
            <div className="stat-item">
              <span className="value">{formattedCadence}</span>
              <span className="label">케이던스</span>
            </div> */}
          </div>

          {/* 🔹 1) 썸네일 이미지 (카메라 사진) */}
          <div className="detail-image-container">
            {thumbnail ? (
              <img src={thumbnail} alt="thumbnail" className="detail-image" />
            ) : (
              <div className="no-image-placeholder">
                <p>러닝 사진이 없습니다.</p>
              </div>
            )}
          </div>

          {/* 🔹 2) 지도 캡처(detailImage) */}
          {detailImage && (
            <div
              className="detail-image-container"
              style={{ marginTop: "20px" }}
            >
              <img src={detailImage} alt="지도 캡처" className="detail-image" />
            </div>
          )}

          {/* 코스 정보 */}
          <div className="course-info-section">
            <h3 className="ssection-title">러닝 코스</h3>
            <div className="archiving-detail-course-wrapper">
              {course ? (
                <CourseItem course={course} />
              ) : (
                <p className="no-course-info">연결된 코스 정보가 없습니다.</p>
              )}
            </div>
          </div>

          {/* 구간(이 코스의 다른 아카이빙들) */}
          <div className="laps-section">
            <h3 className="ssection-title">구간</h3>
            <table className="laps-table">
              <thead>
                <tr>
                  <th>km</th>
                  <th>평균 페이스</th>
                  <th>시간</th>
                </tr>
              </thead>
              <tbody>
                {courseArchivings.length > 0 ? (
                  courseArchivings.map((item) => (
                    <tr
                      key={item.archiving_id}
                      className="course-archiving-row"
                      onClick={() =>
                        navigate(`/archiving/${item.archiving_id}`)
                      }
                    >
                      <td>{item.distance.toFixed(2)}</td>
                      <td>{item.average_pace}</td>
                      <td>{item.time}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="3"
                      style={{
                        textAlign: "center",
                        padding: "20px",
                        color: "rgba(255,255,255,0.6)",
                      }}
                    >
                      이 코스의 다른 기록이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 메모 */}
          <div className="memo-section">
            <h3 className="ssection-title">메모</h3>
            {isEditingMemo ? (
              <textarea
                value={newContent}
                onChange={(e) =>
                  setNewContent(e.target.value.substring(0, MAX_MEMO_LENGTH))
                }
                onBlur={handleMemoUpdate}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    handleMemoUpdate();
                    e.preventDefault();
                  }
                }}
                className="memo-textarea"
                rows={memoRowCount}
                autoFocus
              />
            ) : (
              <p
                className="memo-content"
                onClick={() => setIsEditingMemo(true)}
                style={{ minHeight: `${memoRowCount * 1.5}em` }}
              >
                {finalMemoContent || "메모를 추가하려면 클릭하세요."}
              </p>
            )}
            <p className="memo-char-count">{displayedLength}자</p>
          </div>
        </div>
      </div>

      <BottomNavigator />
    </AppContainer>
  );
}

export default ArchivingDetailPage;
