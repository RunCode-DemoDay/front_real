// src/pages/AuthHandlerPage/AuthHandlerPage.jsx

import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import apiClient from "../../api"; 
import { getMyInfo } from "../../api/userAPI"; 


const KAKAO_CALLBACK_API = "/login/oauth2/code/kakao";
const ME_API = "/users/me";


function storeTokens({ accessToken, refreshToken }) {
  if (accessToken) {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("access_token", accessToken);
  }
  if (refreshToken) {
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("refresh_token", refreshToken);
  }
}


function getStoredAccessToken() {
  return (
    localStorage.getItem("accessToken") ||
    localStorage.getItem("access_token") ||
    null
  );
}


function hasRunType(type) {
  if (!type) return false;

 
  if (typeof type === "string") {
    return type.trim().length > 0;
  }

 
  return !!(type.id || type.name);
}

async function fetchAndLoginUser(loginSuccess) {
  try {
    
    const response = await getMyInfo();
    const raw = response.data;

    const userProfile = {
      id: raw.id ?? raw.userId ?? null,
      name: raw.nickname || raw.name || raw.username || "러너",
      nickname: raw.nickname ?? raw.name ?? null,
      email: raw.email ?? null,
      profileImage: raw.profileImage || raw.thumbnailImage || null,
      type: raw.type ?? null,
    };

    loginSuccess(userProfile);
    return userProfile;
  } catch (e) {
    console.error("❌ /users/me 호출 실패:", e?.response?.data || e.message);
    return null;
  }
}

export default function AuthHandlerPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { loginSuccess } = useAuth();

  
  const handleTokenFromQuery = async (params) => {
    const tokenFromQuery =
      params.get("token") ||
      params.get("access") ||
      params.get("access_token") ||
      params.get("accessToken");
    const refreshFromQuery =
      params.get("refresh") ||
      params.get("refresh_token") ||
      params.get("refreshToken");

    if (!tokenFromQuery) return false;

    console.log("✅ query에서 accessToken 수신:", tokenFromQuery);
    storeTokens({
      accessToken: tokenFromQuery,
      refreshToken: refreshFromQuery,
    });

    const me = await fetchAndLoginUser(loginSuccess);
    const hasType = hasRunType(me?.type);
    navigate(hasType ? "/home" : "/quiz/1", { replace: true });
    return true;
  };

 
  const handleCodeFromQuery = async (params) => {
    const code = params.get("code");
    const state = params.get("state");

    if (!code) return false;

    try {
      const res = await apiClient.get(KAKAO_CALLBACK_API, { params: { code, state } }); 
      const payload = res?.data?.data ?? res?.data ?? {};
      const accessToken = payload.accessToken || payload.access_token || null;
      const refreshToken = payload.refreshToken || payload.refresh_token || null;

      storeTokens({ accessToken, refreshToken });

      let userProfile = null;
      if (payload.user || payload.profile || payload.name || payload.nickname) {
        const user = payload.user || payload.profile || payload;
        userProfile = {
          id: user.id ?? user.userId ?? null,
          name: user.nickname || user.name || user.username || "러너",
          nickname: user.nickname ?? user.name ?? null,
          email: user.email ?? null,
          profileImage: user.profileImage || user.thumbnailImage || null,
          type: user.type ?? payload.type ?? null,
        };
        loginSuccess(userProfile);
      } else {
        userProfile = await fetchAndLoginUser(loginSuccess);
      }

      const hasType = hasRunType(userProfile?.type);
      navigate(hasType ? "/home" : "/quiz/1", { replace: true });
    } catch (err) {
      console.error("❌ 카카오 로그인 교환 실패:", err);
      if (err.response) {
        console.error("❌ 서버 응답:", err.response.status, err.response.data);
      }
      navigate("/login", { replace: true });
    }
    return true;
  };

  useEffect(() => {
    const handleLogin = async () => {
      const params = new URLSearchParams(location.search);

      
      if (await handleTokenFromQuery(params)) return;

      
      if (await handleCodeFromQuery(params)) return;

      
      console.error("❌ token/code 없음 → /login 이동");
      navigate("/login", { replace: true });
    };

    handleLogin();
  }, [location.search, navigate, loginSuccess]); 

  return (
    <div style={{ color: "#fff", padding: 24, textAlign: "center" }}>
      로그인 처리 중입니다...
    </div>
  );
}
