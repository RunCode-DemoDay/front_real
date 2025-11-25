// src/api/mockCourseDetailAPI.js


const MOCK_COURSE_DETAIL = {
    "title": "한강 반포 러닝 코스",
    "content": "노을과 야경을 즐기며 달릴 수 있는 대표 한강 코스",
    "address": "서울시 서초구 반포동 (고속터미널역 8-1 출구)",
    "distance": 5.0, // number
    "distance_description": "(반포대교–잠수교 순환)",
    "thumbnail" : "../../public/course_img.jpg",
    "detail_images": [
      "../../public/course_img.jpg",
      "../../public/course_img.jpg"
    ],
    "isBookmarked": true
};


const MOCK_REVIEWS_DATA = {
    "course_id": 1,
    "star_average": 4.9,
    "review_count": 100,
    "reviews": [
      {
        "review_id": 101,
        "nickname": "돈많은백수를원해",
        "profile_image": "https://runcode-likelion.s3.us-east-2.amazonaws.com/mock/user1.jpg",
        "star": 5.0,
        "content": "언제든 달리기하기 좋아요. 대신에 여름엔 날벌레가 좀 많은 편이에요.",
        "created_at": "2025-10-06"
      },
      {
        "review_id": 102,
        "nickname": "마포러너",
        "profile_image": "https://runcode-likelion.s3.us-east-2.amazonaws.com/mock/user2.jpg",
        "star": 4.5,
        "content": "밤에 조용하게 뛰기 좋지만 가로등이 적어요.",
        "created_at": "2025-10-05"
      }
    ]
};


export const fetchCourseDetail = (courseId) => {
    return new Promise(resolve => {
        setTimeout(() => resolve(MOCK_COURSE_DETAIL), 400);
    });
};


export const fetchCourseReviews = (courseId, order = 'LATEST') => {
    return new Promise(resolve => {
        setTimeout(() => resolve(MOCK_REVIEWS_DATA), 400);
    });
};