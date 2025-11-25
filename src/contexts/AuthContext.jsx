// src/contexts/AuthContext.jsx

import React, { createContext, useState, useContext, useCallback, useEffect } from 'react'; 


const MOCK_PROFILE = {
    id: "1234567890",
    name: "송명은",
    nickname: "송명은",
    profileImage: "https://...",
    type: { id: 1, name: "새벽 솔로 도전자" }
};


const fetchMyProfile = () => {
    
    return new Promise((resolve) => {
        setTimeout(() => {
           
            resolve(MOCK_PROFILE); 
        }, 100); 
    });
};



const AuthContext = createContext(null);


export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
   
    const [isLoading, setIsLoading] = useState(true); 

    const loginSuccess = useCallback((userData) => {
        setIsAuthenticated(true);
        setUserProfile(userData);
    }, []);

    const logout = useCallback(() => {
        setIsAuthenticated(false);
        setUserProfile(null);
       
    }, []);
    
   
    useEffect(() => {
        const loadUser = async () => {
            try {
                
                const user = await fetchMyProfile(); 

               
                setIsAuthenticated(true);
                setUserProfile(user);
            } catch (error) {
               
                setIsAuthenticated(false);
                setUserProfile(null);
            } finally {
              
                setIsLoading(false); 
            }
        };

        loadUser();
    }, []); 

    return (
        <AuthContext.Provider value={{ 
            isAuthenticated, 
            userProfile, 
            isLoading, 
            loginSuccess, 
            logout 
        }}>
            {children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => useContext(AuthContext);