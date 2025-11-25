// src/pages/RealStartPage/RealStartPage.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppContainer from "../../AppContainer/AppContainer";
import "./RealStartPage.css";

import RunCodeIcon from "../../assets/runcordicon.svg";


const RealStartPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");
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
