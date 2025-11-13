import React, { useState } from 'react'; 
import './BottomNavigator.css';
import { useNavigate, useLocation } from 'react-router-dom'; 

// ⭐ S3 에셋 링크 정의 (유지)
const ICON_ASSETS = {
    save: {
        on: 'https://runcode-likelion.s3.us-east-2.amazonaws.com/navigator/save_on.svg',
        off: 'https://runcode-likelion.s3.us-east-2.amazonaws.com/navigator/save_off.svg'
    },
    home: {
        on: 'https://runcode-likelion.s3.us-east-2.amazonaws.com/navigator/home_on.svg',
        off: 'https://runcode-likelion.s3.us-east-2.amazonaws.com/navigator/home_off.svg'
    },
    record: {
        on: 'https://runcode-likelion.s3.us-east-2.amazonaws.com/navigator/archiving_on.svg',
        off: 'https://runcode-likelion.s3.us-east-2.amazonaws.com/navigator/archiving_off.svg'
    },
    my: {
        on: 'https://runcode-likelion.s3.us-east-2.amazonaws.com/navigator/mypage_on.svg',
        off: 'https://runcode-likelion.s3.us-east-2.amazonaws.com/navigator/mypage_off.svg'
    }
};

const BottomNavigator = () => {
    const navigate = useNavigate();
    const location = useLocation(); // ⭐ 현재 URL 정보를 가져옵니다.

    const navItems = [
        { name: '저장', key: 'save', path: '/saved' },
        { name: '홈', key: 'home', path: '/home' },
        { name: '런코드', key: 'record', path: '/archiving' }, // ⭐ '/archiving/map' 또는 '/archiving/list'를 포괄하도록 '/archiving'으로 수정
        { name: '마이', key: 'my', path: '/mypage' },      
    ];
    
    const handleTabClick = (path) => {
        navigate(path);
    };
    
    // ⭐ URL을 기반으로 현재 탭의 키를 확인하는 함수
    const getCurrentActiveKey = () => {
        const currentPath = location.pathname;
        
        // 가장 구체적인 경로(가장 긴 path)부터 검사하여 정확한 활성 탭을 찾습니다.
        const activeItem = navItems.find(item => currentPath.startsWith(item.path));
        
        return activeItem ? activeItem.key : ''; 
    };
    
    const activeKey = getCurrentActiveKey(); // 현재 활성 키

    return (
        <div className="nav-wrapper">
            <div className="nav-container">
                {navItems.map(item => {
                    // URL 경로와 아이템의 경로가 일치하는지 확인하여 활성화
                    const isActive = activeKey === item.key;
                    const iconSrc = isActive ? ICON_ASSETS[item.key].on : ICON_ASSETS[item.key].off;
                    
                    return (
                        <div 
                            key={item.key} 
                            className={`nav-item ${isActive ? 'active' : ''}`}
                            /* '런코드'의 경우 path는 '/archiving/map'으로 통일 */
                            onClick={() => handleTabClick(item.key === 'record' ? '/archiving/map' : item.path)} 
                        >
                            <div className="icon-placeholder">
                                <img src={iconSrc} alt={`${item.name} 아이콘`} style={{ width: '24px', height: '24px' }}/> 
                            </div> 
                            <span className="nav-text">{item.name}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNavigator;