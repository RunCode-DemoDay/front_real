// src/pages/AuthHandlerPage/AuthHandlerPage.jsx

import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";

// ✅ Vite 프록시 경유 (CORS 안전)
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
    const res = await axios.get(ME_API, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    });

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

  useEffect(() => {
    const handleLogin = async () => {
      const params = new URLSearchParams(location.search);

      // 백엔드가 쿼리로 내려줄 수 있는 다양한 키 대응
      const tokenFromQuery =
        params.get("token") ||
        params.get("access") ||
        params.get("access_token") ||
        params.get("accessToken") ||
        null;

      const refreshFromQuery =
        params.get("refresh") ||
        params.get("refresh_token") ||
        params.get("refreshToken") ||
        null;

      const code = params.get("code");
      const state = params.get("state");

      // ✅ (A) 백엔드가 query로 accessToken(및 refresh)을 바로 내려주는 경우
      if (tokenFromQuery) {
        console.log("✅ query에서 accessToken 수신:", tokenFromQuery);
        storeTokens({
          accessToken: tokenFromQuery,
          refreshToken: refreshFromQuery,
        });

        // 프로필 조회 시도 (이름/유형 반영)
        const me = await fetchAndLoginUser(loginSuccess);

        // 🔥 유형이 있으면 홈, 없으면 런BTI 첫 문제(/quiz/1)
        const hasType = hasRunType(me?.type);
        navigate(hasType ? "/home" : "/quiz/1", { replace: true });
        return;
      }

      // ✅ (B) code/state만 온 경우 → 백엔드에 교환 요청
      if (code) {
        try {
          const res = await axios.get(KAKAO_CALLBACK_API, {
            params: { code, state },
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          });

          const payload = res?.data?.data ?? res?.data ?? {};
          const accessToken =
            payload.accessToken || payload.access_token || null;
          const refreshToken =
            payload.refreshToken || payload.refresh_token || null;

          // 토큰 저장
          storeTokens({ accessToken, refreshToken });

          // 우선 응답에 유저 정보가 있으면 쓰고, 없으면 /users/me로 보강
          let userProfile = null;

          if (
            payload.user ||
            payload.profile ||
            payload.name ||
            payload.nickname
          ) {
            const user = payload.user || payload.profile || payload;

            userProfile = {
              id: user.id ?? user.userId ?? null,
              // ✅ 여기서도 nickname 우선
              name: user.nickname || user.name || user.username || "러너",
              nickname: user.nickname ?? user.name ?? null,
              email: user.email ?? null,
              profileImage:
                user.profileImage || user.thumbnailImage || null,
              type: user.type ?? payload.type ?? null,
            };
            loginSuccess(userProfile);
          } else {
            userProfile = await fetchAndLoginUser(loginSuccess);
          }

          // 🔥 여기서도 동일하게: 유형 있으면 홈, 없으면 퀴즈 첫 페이지
          const hasType = hasRunType(userProfile?.type);
          navigate(hasType ? "/home" : "/quiz/1", { replace: true });
          return;
        } catch (err) {
          console.error("❌ 카카오 로그인 교환 실패:", err);
          if (err.response) {
            console.error(
              "❌ 서버 응답:",
              err.response.status,
              err.response.data
            );
          }
          navigate("/login", { replace: true });
          return;
        }
      }

      // ✅ (C) token도 code도 없음 → 잘못 진입
      console.error("❌ token/code 없음 → /login 이동");
      navigate("/login", { replace: true });
    };

    handleLogin();
  }, [location, navigate, loginSuccess]);

  return (
    <div style={{ color: "#fff", padding: 24, textAlign: "center" }}>
      로그인 처리 중입니다...
    </div>
  );
}
