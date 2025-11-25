import React, { useState } from 'react'; 
import './BottomNavigator.css';
import { useNavigate, useLocation } from 'react-router-dom'; 


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
    const location = useLocation(); 

    const navItems = [
        { name: '저장', key: 'save', path: '/saved' },
        { name: '홈', key: 'home', path: '/home' },
        { name: '런코드', key: 'record', path: '/archiving' }, 
        { name: '마이', key: 'my', path: '/mypage' },      
    ];
    
    const handleTabClick = (path) => {
        navigate(path);
    };
    
    
    const getCurrentActiveKey = () => {
        const currentPath = location.pathname;
        
       
        const activeItem = navItems.find(item => currentPath.startsWith(item.path));
        
        return activeItem ? activeItem.key : ''; 
    };
    
    const activeKey = getCurrentActiveKey(); 

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