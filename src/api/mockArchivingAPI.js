// src/api/mockArchivingAPI.js

// --- 아카이빙 목록 Mock 데이터 (위치 정보 추가) ---
const MOCK_ARCHIVINGS_DATA = [
    {
        "id": 1,
        "thumbnail": "https://example.com/archiving1.jpg",
        "latitude": 37.5615,   // 지도 중앙을 위한 예시 위도 (반포 인근)
        "longitude": 126.9360, // 지도 중앙을 위한 예시 경도
        "title": "한강 반포 - 잠수교 순환" // 하단 요약 정보
    },
    {
        "id": 2,
        "thumbnail": "https://example.com/archiving2.jpg",
        "latitude": 37.5560,
        "longitude": 126.9450,
        "title": "신촌 연세로 코스"
    },
    {
        "id": 3,
        "thumbnail": "https://example.com/archiving3.jpg",
        "latitude": 37.5675,
        "longitude": 126.9550,
        "title": "종로 N서울타워 코스"
    }
];

// --- 아카이빙 상세 Mock 데이터 ---
const MOCK_ARCHIVING_DETAIL = {
    "id": 1,
    "user_id": 1,
    "title": "강한 자는 추석연휴에도 달린다.",
    "content": "추석에 먹은 만큼 달려보겠습니다",
    "thumbnail": "https://placehold.co/500x200/505050/FFFFFF?text=Map+Route",
    "detailImage": "../../public/course_detail.png", // 메인 아카이빙 사진
    "distance": 2.00, // 와이어프레임에 맞춰 2.00km
    "calorie": 108,
    "average_pace": "5'45\"", // 와이어프레임에 맞춰 5'45"
    "time": "11:31", // 와이어프레임에 맞춰 11:31
    "altitude": 108,
    "cadence": 154,
    "course": {
        "course_id": 1,
        "title": "한강 반포 - 잠수교 순환",
        "thumbnail": "https://example.com/course1.jpg",
        "content": " 아침 햇살과 강바람을 맞으며 기록에 집중하기 좋은 한강 대표 코스",
        "star_average": 4.90,
        "review_count": 100,
        "distance": 5.00
    },
    "laps": [
        {
            "lap_id": 1,
            "lap_number": 1,
            "average_pace": "5'29\"",
            "pace_variation": "-",
            "altitude": 8
        },
        {
            "lap_id": 2,
            "lap_number": 2,
            "average_pace": "5'55\"",
            "pace_variation": "+0'26\"",
            "altitude": 0
        }
    ]
};

/**
 * [Mock API] 아카이빙 목록 조회 (GET /archivings?order={latest})
 * @returns {Promise<Array>} 아카이빙 목록 데이터
 */
export const fetchArchivings = (order = 'LATEST') => {
    return new Promise(resolve => {
        // 실제 API처럼 400ms 딜레이 후 데이터 반환
        setTimeout(() => resolve(MOCK_ARCHIVINGS_DATA), 400);
    });
};

/**
 * [Mock API] 아카이빙 상세 조회 (GET /archivings/{archivingId})
 * @param {number} archivingId 조회할 아카이빙 ID
 * @returns {Promise<Object>} 아카이빙 상세 데이터
 */
export const fetchArchivingDetail = async (archivingId) => {
    if (!archivingId || isNaN(parseInt(archivingId))) {
        return null;
    }
    return new Promise(resolve => {
        // 실제 API처럼 400ms 딜레이 후 상세 데이터 반환 (현재 ID에 관계없이 동일한 상세 데이터 반환)
        setTimeout(() => resolve({ ...MOCK_ARCHIVING_DETAIL, archiving_id: parseInt(archivingId) }), 400);
    });
};

// --- 코스별 아카이빙 목록 Mock 데이터 ---
const MOCK_COURSE_ARCHIVINGS = [
    {
        "archiving_id": 1,
        "date" : "2025-10-06",
        "title" : "강한 자는 추석 연휴에도 달린다.",
        "thumbnail":"https://placehold.co/500x200/E3E3E3/000000?text=Past+Run+1",
        "distance": 2.00,
        "average_pace":"5'45\"",
        "time":"11:31"
    },
    {
        "archiving_id": 102,
        "date" : "2025-09-28",
        "title" : "추석 다음날 달리기",
        "thumbnail":"https://placehold.co/500x200/D9D9D9/000000?text=Past+Run+2",
        "distance": 4.98,
        "average_pace":"5'55\"",
        "time":"29:27"
    }
];

/**
 * [Mock API] 코스별 아카이빙 목록 조회 (GET /courses/{courseId}/archivings)
 */
export const fetchArchivingsByCourse = async (courseId) => {
    if (!courseId) return [];
    return new Promise(resolve => setTimeout(() => resolve(MOCK_COURSE_ARCHIVINGS), 300));
};