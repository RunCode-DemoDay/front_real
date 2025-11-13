// src/pages/LoginCallBack/LoginCallBack.jsx

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginCallBack() {
  const navigate = useNavigate();

  useEffect(() => {
    // 예: /oauth/kakao/callback?access=...&refresh=...
    const search = window.location.search; // "?access=...&refresh=..."
    const params = new URLSearchParams(search);

    const access = params.get("access");
    const refresh = params.get("refresh");

    // 토큰 저장
    if (access) {
      localStorage.setItem("access_token", access);
    }
    if (refresh) {
      localStorage.setItem("refresh_token", refresh);
    }

    // 다 했으니 홈으로 보내기 (원하면 /home 말고 다른 곳으로)
    navigate("/home", { replace: true });
  }, [navigate]);

  return (
    <div
      style={{
        color: "#fff",
        padding: "24px",
        textAlign: "center",
      }}
    >
      로그인 처리 중입니다...
    </div>
  );
}
