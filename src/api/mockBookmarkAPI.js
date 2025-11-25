// src/api/mockBookmarkAPI.js


export const MOCK_BOOKMARKS = { 2: 102, 12: 101 }; 

const MOCK_BOOKMARK_DATA = [
    {
        "bookmark_id": 101,
        "course_id": 12,
        "title": "한강 반포 러닝 코스",
        "content": "아침 햇살과 강바람을 맞으며 기록에 집중하기 좋은 한강 대표 코스",
        "thumbnail": "../../public/course_img.jpg", 
        "star_average": 4.9,
        "review_count": 100,
        "distance": 5.0,
        "is_bookmarked": true // 저장된 목록이므로 기본 상태는 true
    },
    {
        "bookmark_id": 102,
        "course_id": 8,
        "title": "경의선 숲길 러닝 코스",
        "content": "도심 속 녹음을 느끼며 조용히 달리기 좋은 코스",
        "thumbnail": "../../public/course_img.jpg", 
        "star_average": 4.7,
        "review_count": 58,
        "distance": 4.23,
        "is_bookmarked": true
    }
];

/**
 * 
 * @param {string} order 
 * @returns {Promise<object>} 
 */
export const fetchBookmarks = (order) => {
    console.log(`[Mock API] 북마크 목록 조회 요청됨: Order=${order}`);
    
    return new Promise(resolve => {
        setTimeout(() => {
            let sortedData = [...MOCK_BOOKMARK_DATA];
            
            if (order === 'LATEST') {
               
                sortedData.sort((a, b) => b.bookmark_id - a.bookmark_id); 
            }
          
            resolve(sortedData);  
        }, 500);
    });
};

/**
 
 * @param {number} courseId - 북마크할 코스 ID
 */
export const createBookmark = (courseId) => {
    console.log(`[Mock API] 북마크 생성 요청됨: Course ID=${courseId}`);
    
    return new Promise(resolve => {
        setTimeout(() => {
            const newBookmarkId = Math.floor(Math.random() * 1000) + 200;
            MOCK_BOOKMARKS[courseId] = newBookmarkId; 
            resolve({ 
                success: true, 
                message: "북마크 생성 성공",
                data: { bookmark_id: newBookmarkId, isBookmarked: true }
            });
        }, 200);
    });
};

/**
 
 * @param {number} bookmarkId - 삭제할 북마크 ID
 */
export const deleteBookmark = (bookmarkId) => {
    console.log(`[Mock API] 북마크 삭제 요청됨: Bookmark ID=${bookmarkId}`);

    return new Promise(resolve => {
        setTimeout(() => {
            const courseIdToDelete = Object.keys(MOCK_BOOKMARKS).find(key => MOCK_BOOKMARKS[key] === bookmarkId);
            if (courseIdToDelete) {
                delete MOCK_BOOKMARKS[courseIdToDelete];
            }
            
            resolve({ 
                success: true, 
                message: "북마크 삭제 성공",
                data: { bookmark_id: bookmarkId, isBookmarked: false }
            });
        }, 200);
    });
};