import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MyPage.css";
import LeftArrow from "../../assets/Left.svg";
import BottomNavigator from "../../component/BottomNavigator/BottomNavigator";

const MyPage = () => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleGoToReviewAdd = () => {
    navigate("/reviewadd");
  };

  const handleGoToReviewMy = () => {
    navigate("/reviewmy");
  };

  const handleGoToRunnerType = () => {
    navigate("/start");
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

  return (
    <>
      <div className="mypage">
        {/* 상단 타이틀 */}
        <h2 className="mypage-title">마이페이지</h2>

        {/* 프로필 */}
        <section className="mypage-profile">
          <img
            src="/images/profile-default.png"
            alt="프로필"
            className="mypage-avatar"
          />
          <p className="mypage-username">송명은카톡아이디</p>
        </section>

        {/* 러너 유형 */}
        <section className="mypage-runner" onClick={handleGoToRunnerType}>
          <div className="runner-info">
            <p className="runner-label">러너 유형</p>
            <p className="runner-value">새벽 출몰 도전자</p>
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
