// src/pages/MyPage/MyPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./MyPage.css";
import LeftArrow from "../../assets/Left.svg";
import BottomNavigator from "../../component/BottomNavigator/BottomNavigator";
import { getMyInfo } from "../../api/userAPI";
import AppContainer from "../../AppContainer/AppContainer";

const MyPage = () => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const res = await getMyInfo();
        if (res.success) {
          setUserProfile(res.data);
        } else {
          console.warn("사용자 정보 조회 실패:", res.message);
        }
      } catch (error) {
        console.error("사용자 정보 조회 중 에러 발생:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleGoToReviewAdd = () => navigate("/reviewadd");
  const handleGoToReviewMy = () => navigate("/reviewmy");

  const handleGoToRunnerType = () => {
    navigate("/start", { state: { from: "mypage-reset" } });
  };

  const handleLogoutClick = () => setShowLogoutModal(true);
  const handleLogoutCancel = () => setShowLogoutModal(false);

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    navigate("/login");
  };

  if (loading) {
    return (
      <AppContainer>
        <div className="mypage-loading">
          <p>사용자 정보를 불러오는 중입니다...</p>
        </div>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <div className="mypage">
        <h2 className="mypage-title">마이페이지</h2>

        <section className="mypage-profile">
          <img
            src={userProfile?.profileImage || "/images/profile-default.png"}
            alt="프로필"
            className="mypage-avatar"
          />
          <p className="mypage-username">
            {userProfile?.nickname || userProfile?.name || "사용자"}
          </p>
        </section>

        <section className="mypage-runner" onClick={handleGoToRunnerType}>
          <div className="runner-info">
            <p className="runner-label">러너 유형</p>
            <p className="runner-value">{userProfile?.type || "유형 미등록"}</p>
          </div>
          <img src={LeftArrow} alt="arrow" className="runner-arrow rotated" />
        </section>

        <div className="mid-divider" />

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
    </AppContainer>
  );
};

export default MyPage;
