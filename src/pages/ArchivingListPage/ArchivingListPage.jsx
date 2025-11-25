import React, { useState, useEffect, useCallback } from 'react';
import AppContainer from '../../AppContainer/AppContainer';
import './ArchivingListPage.css';
import BottomNavigator from '../../component/BottomNavigator/BottomNavigator';
import { useNavigate } from 'react-router-dom';
import { getMyArchivedAll } from '../../api/archivingAPI';
import CustomSelect from '../../component/CustomSelect/CustomSelect';


const ASSET_ICONS = {
    map_off : "https://runcode-likelion.s3.us-east-2.amazonaws.com/archiving/map_off.svg",
    list_on : "https://runcode-likelion.s3.us-east-2.amazonaws.com/archiving/list_on.svg", 
    list_off : "https://runcode-likelion.s3.us-east-2.amazonaws.com/archiving/list_off.svg", 
    map_on : "https://runcode-likelion.s3.us-east-2.amazonaws.com/archiving/map_on.svg", 
    dropdown : "https://runcode-likelion.s3.us-east-2.amazonaws.com/global/dropdown.svg",
};


// --- 컴포넌트: 개별 썸네일 아이템 ---
const ArchivingThumbnailItem = ({ thumbnail, id, onClick }) => {
    return (
       
        <div className="archiving-list-thumbnail-item" onClick={onClick}>
            {thumbnail ? (
                
                <img src={thumbnail} alt={`Archiving ${id}`} className="archiving-list-thumbnail-image" />
            ) : (
                
                <div className="archiving-list-thumbnail-placeholder">No Image</div>
            )}
        </div>
    );
};


function ArchivingListPage() {
    const [archivingList, setArchivingList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [orderBy, setOrderBy] = useState('latest'); 

    const navigate = useNavigate();

    // 데이터 로딩 로직
    const loadData = useCallback(async (order) => {
        setLoading(true);
        try {
            console.log("아카이빙 목록 로딩 시작",order);
            const response = await getMyArchivedAll(order);
            if (response.success) {
                console.log("아카이빙 목록 로딩 성공:", response.data);
                setArchivingList(response.data);
            }
        } catch (error) {
            console.error("아카이빙 목록 로딩 실패:", error);
            setArchivingList([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData(orderBy);
    }, [orderBy, loadData]); 

    
    const handleViewMap = useCallback(() => {
        navigate('/archiving/map'); 
    }, [navigate]);

   
    const handleThumbnailClick = useCallback((archivingId) => {
        navigate(`/archiving/${archivingId}`);
    }, [navigate]);

    // 정렬 기준 변경 핸들러
    const handleSortChange = (newValue) => {
        setOrderBy(newValue); 
    };

    const sortOptions = [
        { label: "최신순", value: "latest" },
        { label: "오래된순", value: "oldest" },
    ];

    return (
        
        <AppContainer className="archiving-list-full-height-container">
            
            <div className="archiving-list-page-container">

               
                <header className="archiving-list-header">
                  
                    <h1 className="archiving-list-header-title">나의 런코드</h1>
                  
                    <div className="archiving-list-header-icons">
                        
                      
                        <button 
                            className="archiving-list-header-icon-button-map"
                            onClick={handleViewMap}
                        >
                            <img src={ASSET_ICONS.map_off} alt="지도 뷰" className="archiving-list-icon" />
                        </button>

                       
                        <button className="archiving-list-header-icon-button-list active">
                            <img src={ASSET_ICONS.list_on} alt="목록 뷰" className="archiving-list-icon" />
                        </button>
                    </div>
                </header>

              
                <div className="archiving-list-header-and-sort-bar-spacer"></div>

               
                <div className="archiving-list-sort-bar">
                    <CustomSelect
                        options={sortOptions}
                        value={orderBy}
                        onChange={handleSortChange}
                    />
                </div>

             
                <div className="archiving-list-grid-area">
                    {loading ? (
                       
                        <div className="archiving-list-loading-message">목록을 불러오는 중...</div>
                    ) : archivingList.length > 0 ? (
                        
                        <div className="archiving-list-grid">
                            {archivingList.map((item) => (
                                <ArchivingThumbnailItem 
                                    key={item.archiving_id}
                                    thumbnail={item.thumbnail}
                                    id={item.archiving_id}
                                    onClick={() => handleThumbnailClick(item.archiving_id)}
                                />
                            ))}
                        </div>
                    ) : (
                        
                        <div className="archiving-list-no-data-message">아카이빙 기록이 없습니다.</div>
                    )}
                </div>
            </div>
            
           
            <BottomNavigator activeItem="runcode" />

        </AppContainer>
    );
}

export default ArchivingListPage;