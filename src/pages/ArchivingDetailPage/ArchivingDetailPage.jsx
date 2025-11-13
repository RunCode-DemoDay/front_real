import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom'; 
import AppContainer from '../../AppContainer/AppContainer';
import BottomNavigator from '../../component/BottomNavigator/BottomNavigator';
import CourseItem from '../../component/CourseItem/CourseItem'; 
import { fetchCourseDetail, fetchCourseReviews } from '../../api/mockCourseDetailAPI'; // 코스 정보 및 리뷰 API 임포트
import { fetchArchivingDetail, fetchArchivingsByCourse } from '../../api/mockArchivingAPI'; // 아카이빙 관련 API 임포트
import './ArchivingDetailPage.css';

// --- 상수 및 에셋 ---
// ⭐ 수정 아이콘 에셋 링크 (유지)
const ASSET_ICONS = {
    edit: 'https://runcode-likelion.s3.us-east-2.amazonaws.com/archiving/edit_icon.svg', 
    back: 'https://runcode-likelion.s3.us-east-2.amazonaws.com/global/back.svg',
    star: 'https://runcode-likelion.s3.us-east-2.amazonaws.com/course/detail/avg_star.svg',
    bookmark: 'https://runcode-likelion.s3.us-east-2.amazonaws.com/course/review.svg',
    distance: 'https://runcode-likelion.s3.us-east-2.amazonaws.com/course/detail/distance.svg',
};

// ⭐ 메모 글자수 제한
const MAX_MEMO_LENGTH = 100;

// 오늘 날짜를 YYYY.MM.DD 형식으로 반환하는 함수
const getTodayDate = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}.${m}.${d}`;
};

function ArchivingDetailPage() {
    // URL에서 archivingId를 가져옴
    const { archivingId } = useParams();
    const { state: locationState } = useLocation(); // 페이지 이동 시 전달받은 데이터
    const navigate = useNavigate();
    
    const [detailData, setDetailData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [newTitle, setNewTitle] = useState('');

    const [courseArchivings, setCourseArchivings] = useState([]); // 코스별 아카이빙 목록 상태
    // ⭐ 메모 상태 추가
    const [isEditingMemo, setIsEditingMemo] = useState(false);
    const [newContent, setNewContent] = useState('');
    
    useEffect(() => { 
        const loadData = async () => {
            setLoading(true);
            try {
                let courseIdForFetch = null;
                let data;
                // ✅ 'new'는 새로 만드는 기록, locationState에서 데이터를 가져옴
                if (archivingId === 'new') {
                    // locationState가 없으면 새 기록을 만들 수 없으므로 에러 처리
                    if (!locationState) {
                        throw new Error("새로운 기록을 생성하기 위한 데이터가 없습니다.");
                    }
                    const today = getTodayDate();

                    // 평균 페이스 계산
                    const paceSecPerKm = (locationState.distanceKm > 0) ? (locationState.elapsedSec || 0) / locationState.distanceKm : 0;
                    const paceMin = Math.floor(paceSecPerKm / 60);
                    const paceSec = String(Math.floor(paceSecPerKm % 60)).padStart(2, '0');
                    const calculatedPace = paceSecPerKm > 0 ? `${paceMin}'${paceSec}"` : "0'00\"";

                    courseIdForFetch = locationState.courseId;
                    // 코스 정보 객체 생성
                    let newCourse = null;
                    if (locationState.courseId) {
                        // courseId로 코스 상세 정보를 API로 다시 불러옵니다.
                        const [courseData, reviewData] = await Promise.all([
                            fetchCourseDetail(locationState.courseId),
                            fetchCourseReviews(locationState.courseId)
                        ]);

                        if (courseData && reviewData) {
                            // 두 API의 결과를 조합하여 CourseItem이 필요로 하는 완전한 객체를 만듭니다.
                            newCourse = { 
                                ...courseData, 
                                ...reviewData,
                                course_id: locationState.courseId };
                        }
                    }

                    data = {
                        archiving_id: 'new',
                        date: today,
                        title: `${today} 러닝 기록`, // 기본 제목 설정
                        content: "", // 메모는 비워둠
                        detailImage: locationState.detailImage, // S3에서 받은 이미지 URL
                        distance: locationState.distanceKm || 0,
                        time: new Date((locationState.elapsedSec || 0) * 1000).toISOString().substr(14, 5),
                        average_pace: calculatedPace,
                        // 백엔드 연동 전 임시 데이터
                        calorie: 0,
                        altitude: 0,
                        cadence: 0,
                        course: newCourse,
                    };
                } else {
                    // ✅ 기존 기록은 API로 조회
                    data = await fetchArchivingDetail(archivingId);
                    if (data && data.course?.course_id) {
                        courseIdForFetch = data.course.course_id;
                        const courseData = await fetchCourseDetail(data.course.course_id);
                        const reviewData = await fetchCourseReviews(data.course.course_id);
                        data.course = { ...courseData, ...reviewData, course_id: data.course.course_id };
                    }
                }

                // ✅ courseId가 있으면, 이 코스의 다른 아카이빙 기록들을 불러옵니다.
                if (courseIdForFetch) {
                    const archivings = await fetchArchivingsByCourse(courseIdForFetch);
                    // 현재 보고 있는 기록(new 포함)은 목록에서 제외
                    const filteredArchivings = archivings.filter(a => String(a.archiving_id) !== String(archivingId));
                    setCourseArchivings(filteredArchivings);
                }

                if (!data) {
                    throw new Error(`ID가 '${archivingId}'인 아카이빙 데이터를 찾을 수 없습니다.`);
                }

                setDetailData(data);
                setNewTitle(data.title);
                setNewContent((data.content || "").substring(0, MAX_MEMO_LENGTH));

            } catch (error) {
                console.error("아카이빙 상세 정보 로딩 실패:", error);
                // TODO: 에러 처리 UI 추가
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [archivingId]);

    // 제목 수정 핸들러 (더미 로직)
    // ✅ 뒤로가기 핸들러: 러닝 플로우에서 왔으면 홈으로, 아니면 뒤로
    const handleBack = useCallback(() => {
        if (locationState?.fromRunning) {
            navigate('/home', { replace: true });
        } else {
            navigate(-1);
        }
    }, [navigate, locationState]);

    const handleTitleUpdate = () => {
        if (newTitle.trim() !== '') {
            // ⭐ API 호출 로직 (생략)
            setDetailData(prev => ({ ...prev, title: newTitle }));
        }
        setIsEditingTitle(false);
    };
    
    // ⭐ 메모 수정 핸들러
    const handleMemoUpdate = () => {
        // API 호출 로직 (생략)
        
        // 메모 100자 자르기 (혹시 입력 중 100자를 넘길 경우 대비)
        const contentToSave = newContent.substring(0, MAX_MEMO_LENGTH);
        
        setDetailData(prev => ({ ...prev, content: contentToSave }));
        setIsEditingMemo(false);
    };

    // 데이터 로딩 중 처리
    if (loading || !detailData) {
        return <AppContainer><div className="detail-loading-screen">상세 정보를 불러오는 중...</div></AppContainer>;
    }

    // ✅ 데이터가 로드된 후에 변수를 구조 분해합니다.
    const { date, title, content, distance, calorie, average_pace, time, altitude, cadence, detailImage, course } = detailData; 

    // ⭐ 최종 표시될 메모 내용 (100자까지만 표시)
    const currentMemo = content || '';
    const finalMemoContent = currentMemo.substring(0, MAX_MEMO_LENGTH); 
    const memoRowCount = Math.ceil(finalMemoContent.length / 30) || 3; 

    // ⭐⭐ 새로운 글자 수 계산 로직 ⭐⭐
    const actualLength = newContent.length;
    // 100자 미만이면 실제 길이를, 100자 이상이면 100을 표시
    const displayedLength = Math.min(actualLength, MAX_MEMO_LENGTH); 

    // KM, 페이스, 시간 포맷팅
    const formattedDistance = distance ? distance.toFixed(2) : '0.00';
    const formattedPace = average_pace ? average_pace.replace(/"/g, "'") : "0'00\"";
    const formattedAltitude = altitude || 0;
    const formattedCadence = cadence || 0;

    return (
        <AppContainer>
            <div className="archiving-detail-container">
                
                {/* 1. 상단 헤더 */}
                <header className="detail-header">
                    <button onClick={handleBack} className="back-button">
                        <img src={ASSET_ICONS.back} alt="뒤로가기" className="icon" />
                    </button>
                </header>

                {/* 2. 스크롤 영역 */}
                <div className="detail-scroll-area">
                    
                    {/* 2-1. 날짜 및 수정 가능 타이틀 */}
                    <div className="title-section">
                        <p className="detail-date">{date}</p>
                        <div className="title-edit-area">
                            {isEditingTitle ? (
                                <input 
                                    type="text"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    onBlur={handleTitleUpdate}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleTitleUpdate(); }}
                                    className="title-input"
                                    autoFocus
                                />
                            ) : (
                                <h2 className="detail-title">{title}</h2>
                            )}
                            <button onClick={() => setIsEditingTitle(true)} className="edit-button">
                                <img src={ASSET_ICONS.edit} alt="수정" className="icon" />
                            </button>
                        </div>
                    </div>

                    {/* 2-2. 상세 기록 정보 (6가지 항목, 2줄) */}
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
{/*                         <div className="stat-item">
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

                    {/* 2-3. 아카이빙 사진 */}
                    <div className="detail-image-container">
                        <img src={detailImage} alt={title} className="detail-image" />
                    </div>
                    
                    {/* 2-4. 코스 정보 (CourseItem 컴포넌트 사용) */}
                    <div className="course-info-section">
                        <h3 className="ssection-title">러닝 코스</h3>
                        <div className="archiving-detail-course-wrapper"> 
                            { course ? <CourseItem course={course} /> : <p className="no-course-info">연결된 코스 정보가 없습니다.</p>} 
                        </div> 
                    </div>
                    
                    {/* 2-5. 구간 기록 (Laps) */}
                    <div className="laps-section">
                        <h3 className="ssection-title">구간</h3>
                        <table className="laps-table">
                            <thead>
                                <tr>
                                    <th>km</th>
                                    <th>평균 페이스</th>
                                    <th>시간</th>
{/*                                     <th>고도</th> */}
                                </tr>
                            </thead>
                            <tbody>
                                {courseArchivings.length > 0 ? courseArchivings.map(item => (
                                    <tr key={item.archiving_id} className="course-archiving-row" onClick={() => navigate(`/archiving/${item.archiving_id}`)}>
                                        <td>{item.distance.toFixed(2)}</td>
                                        <td>{item.average_pace}</td>
                                        <td>{item.time}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: 'rgba(255,255,255,0.6)' }}>이 코스의 다른 기록이 없습니다.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* 2-6. 메모 (100자 제한) */}
                    <div className="memo-section">
                        <h3 className="ssection-title">메모</h3>
                        {/* ⭐ 수정 모드/표시 모드 토글 로직 적용 */}
                        {isEditingMemo ? (
                            <textarea
                                value={newContent}
                                onChange={(e) => setNewContent(e.target.value.substring(0, MAX_MEMO_LENGTH))} // 입력 중 100자 제한
                                onBlur={handleMemoUpdate} 
                                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { handleMemoUpdate(); e.preventDefault(); } }}
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
                        
                        {/* ⭐⭐⭐ 글자 수 표시 수정: 100자를 넘으면 100자로 표시 ⭐⭐⭐ */}
                        <p className="memo-char-count">{displayedLength}자</p>
                    </div>
                    </div>

                </div>
            

            {/* 3. 하단 네비게이터 (URL 기반 활성화) */}
            <BottomNavigator />
        </AppContainer>

    );
}

export default ArchivingDetailPage;