// src/pages/StartPage/StartPage.jsx
import React, { useEffect, useState } from "react";
import "./StartPage.css";
import AppContainer from "../../AppContainer/AppContainer";
import FixedBottomButton from "../../component/FixedBottomButton/FixedBottomButton";
import { useNavigate, useLocation } from "react-router-dom";
import { useRunBTI } from "../QuizPage/RunBTIContext";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";


const ME_API = "/api/users/me";

const getStoredAccessToken = () =>
  localStorage.getItem("accessToken") ||
  localStorage.getItem("access_token") ||
  null;

const StartPage = () => {
  const navigate = useNavigate();
  const location = useLocation(); 
  const { dispatch } = useRunBTI();
  const { userProfile, loginSuccess } = useAuth();

  const [checking, setChecking] = useState(true);

  
  useEffect(() => {
    let cancelled = false;

    
    const isResetFlow = location.state?.from === "mypage-reset";

    const ensureProfile = async () => {

      if (isResetFlow){
        setChecking(false);
        return;
      }

      try {
        const token = getStoredAccessToken();
        if (!token) {
          
          if (!cancelled) setChecking(false);
          return;
        }

        
        if (!isResetFlow && userProfile?.type && (userProfile.type.id || userProfile.type.name)) {
          if (!cancelled) {
            setChecking(false);
            navigate("/home", { replace: true });
          }
          return;
        }

        
        const res = await axios.get(ME_API, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        const raw = res?.data?.data ?? res?.data ?? {};
        const filled = {
          id: raw.id ?? raw.userId ?? null,
          name: raw.name || raw.nickname || raw.username || "러너",
          nickname: raw.nickname ?? null,
          email: raw.email ?? null,
          profileImage: raw.profileImage || raw.thumbnailImage || null,
          type: raw.type ?? null,
        };

        loginSuccess(filled);

       
        if (!isResetFlow && filled.type && (filled.type.id || filled.type.name)) {
          if (!cancelled) navigate("/home", { replace: true });
        } else {
          if (!cancelled) setChecking(false);
        }
      } catch (e) {
        console.warn("StartPage /users/me 실패 → 온보딩 유지", e?.response?.data || e.message);
        if (!cancelled) setChecking(false);
      }
    };

    ensureProfile();
    return () => {
      cancelled = true;
    };
  }, [navigate, userProfile, loginSuccess, location.state]);

  
  useEffect(() => {
    
    const isResetFlow = location.state?.from === "mypage-reset";
    if (isResetFlow) return;

    const hasType = userProfile?.type && (userProfile.type.id || userProfile.type.name);
    if (hasType) navigate("/home", { replace: true });
  }, [userProfile, navigate, location.state]);

  const handleStartClick = () => {
    dispatch({ type: "RESET_QUIZ" });
    navigate("/quiz/1");
  };

  
  if (checking) {
    return (
      <AppContainer>
        <div className="start-page" style={{ color: "#fff", padding: 24, textAlign: "center" }}>
          유형 상태 확인 중…
        </div>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <div className="start-page">
        <div className="start-page-text">
          <h1>
            나만의 러닝 유형을
            <br />
            확인해볼까요?
          </h1>
        </div>

        <div className="content-space" />

        <FixedBottomButton
          label="시작하기"
          onClick={handleStartClick}
          backgroundColor="#FF003C"
        />
      </div>
    </AppContainer>
  );
};

export default StartPage;
