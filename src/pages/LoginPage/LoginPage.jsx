// src/pages/LoginPage/LoginPage.jsx

import React from "react";
import FixedBottomButton from "../../component/FixedBottomButton/FixedBottomButton";
import backgroundImage from "../../assets/running_background.jpg";

function LoginPage() {
  const handleLogin = () => {
    
    const API_BASE =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

    
    const kakaoAuthUrl = `${API_BASE}/oauth2/authorization/kakao`;

    
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
