// src/pages/LoginPage/LoginPage.jsx

import React from "react";
import FixedBottomButton from "../../component/FixedBottomButton/FixedBottomButton";
import backgroundImage from "../../assets/running_background.jpg";

function LoginPage() {
  const handleLogin = () => {
    // .env 에서 백엔드 주소 읽기 (없으면 3000으로)
    const API_BASE =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

    // 백엔드 명세서에 있는 카카오 로그인 시작 엔드포인트
    const kakaoAuthUrl = `${API_BASE}/oauth2/authorization/kakao`;

    // 이건 SPA 내부 라우팅이 아니고 실제 인증 페이지로 가야 하니까
    window.location.href = kakaoAuthUrl;
  };

  return (
    <div
      className="login-container"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        height: "100%",
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <FixedBottomButton
        label="카카오로 계속하기"
        onClick={handleLogin}
        backgroundColor="#FF003C"
        style={{ zIndex: 10 }}
      />
    </div>
  );
}

export default LoginPage;
