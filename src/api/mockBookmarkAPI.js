// src/api/mockBookmarkAPI.js

// NOTE: 이 데이터는 CourseItem.jsx에서 is_bookmarked 초기 상태를 설정하는 데 필요합니다.
// course_id: bookmark_id 형태로 저장됩니다.
export const MOCK_BOOKMARKS = { 2: 102, 12: 101 }; // course_id 2와 12가 북마크 되어있다고 가정

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
 * [Mock API] 북마크 목록을 조회합니다. (GET /bookmarks?order={order})
 * @param {string} order - 정렬 기준 ('LATEST' 등)
 * @returns {Promise<object>} 북마크 코스 목록
 */
export const fetchBookmarks = (order) => {
    console.log(`[Mock API] 북마크 목록 조회 요청됨: Order=${order}`);
    
    return new Promise(resolve => {
        setTimeout(() => {
            let sortedData = [...MOCK_BOOKMARK_DATA];
            
            if (order === 'LATEST') {
                // 북마크 ID 기준으로 내림차순 정렬 (최신 순)
                sortedData.sort((a, b) => b.bookmark_id - a.bookmark_id); 
            }
            // (다른 정렬 옵션 로직 추가 가능)
            
            // NOTE: API 명세서에 맞게 distance를 string 대신 number로 사용
            resolve(sortedData);  // HomePage의 CourseItem과 맞추기 위해 distance 단위를 추가
        }, 500);
    });
};

/**
 * [Mock API] 북마크를 생성합니다. (POST /bookmarks)
 * @param {number} courseId - 북마크할 코스 ID
 */
export const createBookmark = (courseId) => {
    console.log(`[Mock API] 북마크 생성 요청됨: Course ID=${courseId}`);
    
    return new Promise(resolve => {
        setTimeout(() => {
            const newBookmarkId = Math.floor(Math.random() * 1000) + 200;
            MOCK_BOOKMARKS[courseId] = newBookmarkId; // Mock 저장소 업데이트
            resolve({ 
                success: true, 
                message: "북마크 생성 성공",
                data: { bookmark_id: newBookmarkId, isBookmarked: true }
            });
        }, 200);
    });
};

/**
 * [Mock API] 북마크를 삭제합니다. (DELETE /bookmarks/{bookmarkId})
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