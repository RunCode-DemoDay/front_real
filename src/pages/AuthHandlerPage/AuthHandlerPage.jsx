// src/pages/AuthHandlerPage/AuthHandlerPage.jsx

import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { apiClient } from "../../api/api"; // ✅ apiClient import

// ✅ API 경로는 apiClient가 기본 URL을 관리하므로, 상대 경로만 정의합니다.
const KAKAO_CALLBACK_API = "/api/login/oauth2/code/kakao";
const ME_API = "/api/users/me";

// 공통: 로컬스토리지에 토큰 저장(스네이크/카멜 키 모두)
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

// 공통: Bearer 토큰 꺼내기
function getStoredAccessToken() {
  return (
    localStorage.getItem("accessToken") ||
    localStorage.getItem("access_token") ||
    null
  );
}

// ✅ 러너 유형이 있는지 여부 판단 (문자열/객체 모두 처리)
function hasRunType(type) {
  if (!type) return false;

  // 백엔드가 type을 "새벽 솔로 도전자" 같은 문자열로 줄 수도 있음
  if (typeof type === "string") {
    return type.trim().length > 0;
  }

  // { id, name } 형태일 때
  return !!(type.id || type.name);
}

// 공통: /users/me 로 프로필 가져와서 AuthContext에 반영
async function fetchAndLoginUser(loginSuccess) {
  const token = getStoredAccessToken();
  if (!token) return null;

  try {
    const res = await apiClient.get(ME_API); // ✅ apiClient 사용
    // 백엔드 응답 형태 최대한 유연하게 처리
    const raw = res?.data?.data ?? res?.data?.user ?? res?.data ?? {};

    const userProfile = {
      id: raw.id ?? raw.userId ?? null,
      // ✅ 앱 닉네임(nickname) 우선, 없으면 카카오 name 사용
      name: raw.nickname || raw.name || raw.username || "러너",
      nickname: raw.nickname ?? raw.name ?? null,
      email: raw.email ?? null,
      profileImage: raw.profileImage || raw.thumbnailImage || null,
      type: raw.type ?? null, // 문자열 또는 { id, name }
    };

    loginSuccess(userProfile);
    return userProfile;
  } catch (e) {
    console.error("❌ /users/me 호출 실패:", e?.response?.data || e.message);
    // 프로필을 못 가져와도 로그인은 된 상태일 수 있으니 null 반환
    return null;
  }
}

export default function AuthHandlerPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { loginSuccess } = useAuth();

  // 시나리오 A: URL 쿼리에 토큰이 직접 포함된 경우 처리
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

  // 시나리오 B: 카카오 인증 후 받은 code로 토큰을 교환하는 경우 처리
  const handleCodeFromQuery = async (params) => {
    const code = params.get("code");
    const state = params.get("state");

    if (!code) return false;

    try {
      const res = await apiClient.get(KAKAO_CALLBACK_API, { params: { code, state } }); // ✅ apiClient 사용
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

      // ✅ (A) 백엔드가 query로 accessToken(및 refresh)을 바로 내려주는 경우
      if (await handleTokenFromQuery(params)) return;

      // ✅ (B) code/state만 온 경우 → 백엔드에 교환 요청
      if (await handleCodeFromQuery(params)) return;

      // ✅ (C) token도 code도 없음 → 잘못 진입
      console.error("❌ token/code 없음 → /login 이동");
      navigate("/login", { replace: true });
    };

    handleLogin();
  }, [location.search, navigate, loginSuccess]); // location.search를 직접 의존

  return (
    <div style={{ color: "#fff", padding: 24, textAlign: "center" }}>
      로그인 처리 중입니다...
    </div>
  );
}
