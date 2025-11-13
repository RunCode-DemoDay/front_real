// src/api/mockHomeAPI.js

// =======================================================
// 1. RUN TYPE (ResultPage에서 사용)
// =======================================================

const MOCK_TYPE_DATA = {
    "type_id": 1,
    "name": "새벽 솔로 도전자",
    "description": "아침의 고요 속에서 혼자 달리며 기록에 집중하는 타입<br />꾸준한 루틴과 성취감을 통해 성장하는 러너",
    "thumbnail": "https://example.com/type1.png",
    "tags": [
        { "tag_id": 10, "name": "아침 러너" },
        { "tag_id": 11, "name": "기록 지향" },
        { "tag_id": 12, "name": "솔로런" },
        { "tag_id": 13, "name": "성취감추구" }
    ]
};

export const fetchRunTypeResult = (calculatedTypeId) => {
    console.log(`[Mock API] 유형 결과 조회 요청됨. 코드: ${calculatedTypeId}`);
    return new Promise(resolve => {
        setTimeout(() => resolve(MOCK_TYPE_DATA), 500);
    });
};

export const registerRunType = (typeId) => {
    console.log(`[Mock API] 유형 등록 요청됨. Type ID: ${typeId}`);
    return new Promise(resolve => {
        setTimeout(() => resolve({ success: true, message: '유형 등록 완료' }), 300);
    });
};


// =======================================================
// 2. HOME & COURSE (HomePage, CourseItem에서 사용)
// =======================================================

const TAGS_FROM_TYPE_API = MOCK_TYPE_DATA.tags;

const MOCK_COURSE_DATA = [
    {
        "course_id": 1,
        "title": "한강 반포 - 잠수교 순환",
        "content": "아침 햇살과 강바람을 맞으며 기록에 집중하기 좋은 한강 대표 코스",
        "star_average": 4.9,
        "review_count": 100,
        "distance": 5,
        "is_bookmarked": false,
        "thumbnail": "../../public/course_img.jpg"
    },
    {
        "course_id": 2,
        "title": "올림픽공원 몽촌토성 코스",
        "content": "조용하고 안정적인 트랙 러닝 코스",
        "star_average": 4.7,
        "review_count": 58,
        "distance": 4,
        "is_bookmarked": true,
        "thumbnail": "../../public/course_img.jpg"
    }
];

export const fetchTypeTags = () => {
    return new Promise(resolve => {
        setTimeout(() => resolve(TAGS_FROM_TYPE_API), 300);
    });
};

export const fetchCourses = (tag, order, query) => {
    console.log(`[Mock API] 코스 조회 요청됨: Query=${query}`);
    
    // ⭐ 검색 로직 시뮬레이션: 제목이나 내용에 검색어가 포함된 코스만 필터링
    const filteredCourses = query 
        ? MOCK_COURSE_DATA.filter(course => 
            course.title.includes(query) || course.content.includes(query)
          )
        : MOCK_COURSE_DATA; // 검색어가 없으면 전체 목록 반환

    return new Promise(resolve => {
        setTimeout(() => {
            resolve(filteredCourses);
        }, 500);
    });
};


// =======================================================
// 3. BOOKMARK (CourseItem에서 사용)
// =======================================================

export const MOCK_BOOKMARKS = { 2: 102 };

export const createBookmark = (courseId) => {
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

export const deleteBookmark = (bookmarkId) => {
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

