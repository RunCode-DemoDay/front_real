// src/pages/StartPage/StartPage.jsx
import React, { useEffect, useState } from "react";
import "./StartPage.css";
import AppContainer from "../../AppContainer/AppContainer";
import FixedBottomButton from "../../component/FixedBottomButton/FixedBottomButton";
import { useNavigate } from "react-router-dom";
import { useRunBTI } from "../QuizPage/RunBTIContext";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";

// 프록시(/api) 경유
const ME_API = "/api/users/me";

const getStoredAccessToken = () =>
  localStorage.getItem("accessToken") ||
  localStorage.getItem("access_token") ||
  null;

const StartPage = () => {
  const navigate = useNavigate();
  const { dispatch } = useRunBTI();
  const { userProfile, loginSuccess } = useAuth();

  const [checking, setChecking] = useState(true);

  // ✅ 1) 진입 시: 토큰이 있으면 /users/me 조회해서 Context 채우기
  useEffect(() => {
    let cancelled = false;

    const ensureProfile = async () => {
      try {
        const token = getStoredAccessToken();
        if (!token) {
          // 토큰 없으면 온보딩 유지
          if (!cancelled) setChecking(false);
          return;
        }

        // 이미 type이 있는 프로필이면 바로 홈으로
        if (userProfile?.type && (userProfile.type.id || userProfile.type.name) && userProfile.type.name != "AAAA") {
          if (!cancelled) {
            setChecking(false);
            navigate("/home", { replace: true });
          }
          return;
        }

        // 프로필이 비어있거나 type이 없는 경우 → /users/me 로 채움
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

        // type이 생겼으면 홈으로
        if (filled.type && (filled.type.id || filled.type.name)) {
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
  }, [navigate, userProfile, loginSuccess]);

  // ✅ 2) 이미 메모리에 올라온 프로필에 type이 생기면 즉시 홈으로
  useEffect(() => {
    const hasType = userProfile?.type && (userProfile.type.id || userProfile.type.name);
    if (hasType) navigate("/home", { replace: true });
  }, [userProfile, navigate]);

  const handleStartClick = () => {
    dispatch({ type: "RESET_QUIZ" });
    navigate("/quiz/1");
  };

  // 로딩/확인 중이면 깔끔한 상태 표시
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
