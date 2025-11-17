import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./MyPage.css";
import LeftArrow from "../../assets/Left.svg";
import BottomNavigator from "../../component/BottomNavigator/BottomNavigator";
import { getMyInfo, patchInfo } from "../../api/userAPI"; // ✅ patchInfo 함수를 추가로 임포트합니다.

const MyPage = () => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userProfile, setUserProfile] = useState(null); // ✅ 사용자 프로필 상태
  const [loading, setLoading] = useState(true); // ✅ 로딩 상태

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const res = await getMyInfo();
        if (res.success) {
          setUserProfile(res.data);
        } else {
          console.warn("사용자 정보 조회 실패:", res.message);
          // TODO: 사용자 정보 조회 실패 시 에러 처리 (예: 로그인 페이지로 리디렉션)
        }
      } catch (error) {
        console.error("사용자 정보 조회 중 에러 발생:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleGoToReviewAdd = () => {
    navigate("/reviewadd");
  };

  const handleGoToReviewMy = () => {
    navigate("/reviewmy");
  };

  // ✅ API를 호출하므로 async/await로 비동기 처리합니다.
  const handleGoToRunnerType = async () => {
    try {
      const res = await patchInfo({ "typeCode": "AAAA" }); // type을 초기화하도록 요청
      console.log("러너 유형 초기화 결과:", res);
      navigate("/start");
    } catch (error) {
      console.error("러너 유형 초기화 실패:", error);
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    navigate("/login"); // ✅ 예 클릭 시 LoginPage로 이동
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  if (loading) {
    return (
      <div className="mypage-loading">
        <p>사용자 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  return (
    <>
      <div className="mypage">
        {/* 상단 타이틀 */}
        <h2 className="mypage-title">마이페이지</h2>

        {/* 프로필 */}
        <section className="mypage-profile">
          <img
            src={
              userProfile?.profileImage || "/images/profile-default.png"
            }
            alt="프로필"
            className="mypage-avatar"
          />
          <p className="mypage-username">
            {userProfile?.nickname || userProfile?.name || "사용자"}
          </p>
        </section>

        {/* 러너 유형 */}
        <section className="mypage-runner" onClick={handleGoToRunnerType}>
          <div className="runner-info">
            <p className="runner-label">러너 유형</p>
            <p className="runner-value">{userProfile?.type || "유형 미등록"}</p>
          </div>
          <img src={LeftArrow} alt="arrow" className="runner-arrow rotated" />
        </section>

        <div className="mid-divider" />

        {/* 리뷰 관리 */}
        <section className="mypage-section">
          <p className="section-title">리뷰 관리</p>

          <button className="section-row" onClick={handleGoToReviewAdd}>
            리뷰 작성
          </button>

          <button className="section-row1" onClick={handleGoToReviewMy}>
            작성한 리뷰
          </button>

          <div className="divider" />
          <button className="section-row logout" onClick={handleLogoutClick}>
            로그아웃
          </button>
        </section>

        <BottomNavigator active="mypage" />
      </div>

      {/* 로그아웃 모달 */}
      {showLogoutModal && (
        <div className="logout-modal-overlay">
          <div className="logout-modal-card">
            <p className="logout-modal-text">로그아웃 하시겠습니까?</p>
            <div className="logout-modal-separator" />
            <div className="logout-modal-buttons">
              <button className="logout-yes" onClick={handleLogoutConfirm}>
                예
              </button>
              <div className="logout-divider-vertical" />
              <button className="logout-no" onClick={handleLogoutCancel}>
                아니요
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MyPage;
