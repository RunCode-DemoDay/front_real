// src/contexts/AuthContext.jsx

import React, { createContext, useState, useContext, useCallback, useEffect } from 'react'; // ⭐ useEffect 추가

// 홈 화면 테스트를 위한 Mock 데이터
const MOCK_PROFILE = {
    id: "1234567890",
    name: "송명은",
    nickname: "송명은",
    profileImage: "https://...",
    type: { id: 1, name: "새벽 솔로 도전자" }
};

// ⭐ Mock API: /users/me 호출을 가정 (새로고침 시 세션 확인)
const fetchMyProfile = () => {
    // 실제 환경에서는 유효한 세션 쿠키를 가지고 백엔드 /users/me 엔드포인트에 GET 요청을 보냅니다.
    return new Promise((resolve) => {
        setTimeout(() => {
            // Mock: 세션이 유효하다고 가정하고 Mock 데이터를 반환하여 로그인 상태를 복구합니다.
            resolve(MOCK_PROFILE); 
        }, 100); 
    });
};


// 1. Context 생성
const AuthContext = createContext(null);

// 2. Provider 컴포넌트
export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    // ⭐ 로딩 상태 추가: 인증 정보 복구 중임을 나타냅니다.
    const [isLoading, setIsLoading] = useState(true); 

    const loginSuccess = useCallback((userData) => {
        setIsAuthenticated(true);
        setUserProfile(userData);
    }, []);

    const logout = useCallback(() => {
        setIsAuthenticated(false);
        setUserProfile(null);
        // TODO: 백엔드 로그아웃 API 호출 및 쿠키 삭제 로직 추가 (나중에 구현)
    }, []);
    
    // ⭐ 3. 새로고침 시 로그인 상태 복구 useEffect
    useEffect(() => {
        const loadUser = async () => {
            try {
                // 1. /users/me Mock API 호출을 통해 사용자 정보 로드 시도
                const user = await fetchMyProfile(); 

                // 2. 응답 성공 시 로그인 상태 복구
                setIsAuthenticated(true);
                setUserProfile(user);
            } catch (error) {
                // 3. 응답 실패 시 (세션 만료 등) 로그인 상태 유지 안 함
                setIsAuthenticated(false);
                setUserProfile(null);
            } finally {
                // 4. 로딩 완료
                setIsLoading(false); 
            }
        };

        loadUser();
    }, []); // 마운트 시점에 단 한 번만 실행

    return (
        <AuthContext.Provider value={{ 
            isAuthenticated, 
            userProfile, 
            isLoading, // ⭐ isLoading 상태 제공
            loginSuccess, 
            logout 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

// 4. 사용자 정의 훅 (Hook)
export const useAuth = () => useContext(AuthContext);