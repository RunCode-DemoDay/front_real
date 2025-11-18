import React, { useState, useEffect, useCallback } from 'react';
import AppContainer from '../../AppContainer/AppContainer';
import './ArchivingListPage.css';
import BottomNavigator from '../../component/BottomNavigator/BottomNavigator';
import { useNavigate } from 'react-router-dom';
import { getMyArchivedAll } from '../../api/archivingAPI';
import CustomSelect from '../../component/CustomSelect/CustomSelect';

// --- 아이콘 및 에셋 (ArchivingMapPage에서 사용된 것을 그대로 가져옴) ---
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
        // 클래스 이름 변경: archiving-thumbnail-item -> archiving-list-thumbnail-item
        <div className="archiving-list-thumbnail-item" onClick={onClick}>
            {thumbnail ? (
                // 클래스 이름 변경: thumbnail-image -> archiving-list-thumbnail-image
                <img src={thumbnail} alt={`Archiving ${id}`} className="archiving-list-thumbnail-image" />
            ) : (
                // 클래스 이름 변경: thumbnail-placeholder -> archiving-list-thumbnail-placeholder
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

    // 헤더 액션
    const handleViewMap = useCallback(() => {
        navigate('/archiving/map'); // 지도 페이지로 이동
    }, [navigate]);

    // ⭐ 썸네일 클릭 시 상세 페이지로 이동하는 핸들러
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
        // 클래스 이름 변경: full-height-container -> archiving-list-full-height-container
        <AppContainer className="archiving-list-full-height-container">
            {/* 클래스 이름 변경: archiving-list-page-container -> archiving-list-page-container */}
            <div className="archiving-list-page-container">

                {/* 1. 상단 헤더 */}
                {/* 클래스 이름 변경: list-page-header -> archiving-list-header */}
                <header className="archiving-list-header">
                    {/* 클래스 이름 변경: header-title -> archiving-list-header-title */}
                    <h1 className="archiving-list-header-title">나의 런코드</h1>
                    {/* 클래스 이름 변경: header-icons -> archiving-list-header-icons */}
                    <div className="archiving-list-header-icons">
                        
                        {/* 클래스 이름 변경: header-icon-button-map -> archiving-list-header-icon-button-map */}
                        <button 
                            className="archiving-list-header-icon-button-map"
                            onClick={handleViewMap}
                        >
                            <img src={ASSET_ICONS.map_off} alt="지도 뷰" className="archiving-list-icon" />
                        </button>

                        {/* 클래스 이름 변경: header-icon-button-list -> archiving-list-header-icon-button-list */}
                        <button className="archiving-list-header-icon-button-list active">
                            <img src={ASSET_ICONS.list_on} alt="목록 뷰" className="archiving-list-icon" />
                        </button>
                    </div>
                </header>

                {/* ⭐⭐ 헤더/정렬바의 fixed 위치 확보용 공간 ⭐⭐ */}
                {/* 클래스 이름 변경: header-and-sort-bar-spacer -> archiving-list-header-and-sort-bar-spacer */}
                <div className="archiving-list-header-and-sort-bar-spacer"></div>

                {/* 2. 정렬/토글 바 */}
                {/* 클래스 이름 변경: sort-bar -> archiving-list-sort-bar */}
                <div className="archiving-list-sort-bar">
                    <CustomSelect
                        options={sortOptions}
                        value={orderBy}
                        onChange={handleSortChange}
                    />
                </div>

                {/* 3. 썸네일 그리드 리스트 */}
                {/* 클래스 이름 변경: archiving-grid-area -> archiving-list-grid-area */}
                <div className="archiving-list-grid-area">
                    {loading ? (
                        // 클래스 이름 변경: loading-message -> archiving-list-loading-message
                        <div className="archiving-list-loading-message">목록을 불러오는 중...</div>
                    ) : archivingList.length > 0 ? (
                        // 클래스 이름 변경: archiving-grid -> archiving-list-grid
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
                        // 클래스 이름 변경: no-data-message -> archiving-list-no-data-message
                        <div className="archiving-list-no-data-message">아카이빙 기록이 없습니다.</div>
                    )}
                </div>
            </div>
            
            {/* ⭐⭐⭐ 4. 하단 내비게이션 (활성화 상태 전달) ⭐⭐⭐ */}
            <BottomNavigator activeItem="runcode" />

        </AppContainer>
    );
}

export default ArchivingListPage;