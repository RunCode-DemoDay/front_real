// src/pages/RealStartPage/RealStartPage.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppContainer from "../../AppContainer/AppContainer";
import "./RealStartPage.css";

import RunCodeIcon from "../../assets/runcordicon.svg";
// 🔥 네 실제 경로에 맞게 이름만 확인하면 됨

const RealStartPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login"); // 🔥 3초 뒤 LoginPage로 이동
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <AppContainer>
      <div className="splash-wrapper">
        <img src={RunCodeIcon} alt="RunCode Icon" className="splash-logo" />
      </div>
    </AppContainer>
  );
};

export default RealStartPage;
