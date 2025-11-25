// src/pages/LoginCallBack/LoginCallBack.jsx

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginCallBack() {
  const navigate = useNavigate();

  useEffect(() => {
   
    const search = window.location.search; 
    const params = new URLSearchParams(search);

    const access = params.get("access");
    const refresh = params.get("refresh");

    
    if (access) {
      localStorage.setItem("access_token", access);
    }
    if (refresh) {
      localStorage.setItem("refresh_token", refresh);
    }

   
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
