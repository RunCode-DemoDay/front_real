// src/api/mockMyPageAPI.js

// 📍 리뷰 미작성 코스 (ReviewAdd.jsx용)
export const mockUnreviewedCourses = [
  {
    course_id: 1,
    title: "한강 반포 러닝 코스",
    content: "야경이 아름다운 강변길 코스예요. 초보 러너에게 추천!",
    star_average: 4.9,
    review_count: 120,
    distance: 5.2,
    is_bookmarked: false,
    thumbnail:
      "../../public/course_img.jpg",
  },
  {
    course_id: 2,
    title: "서울숲 트랙 러닝 코스",
    content: "나무 향기와 함께 달리기 좋은 도심 속 러닝 코스.",
    star_average: 4.7,
    review_count: 87,
    distance: 3.8,
    is_bookmarked: true,
    thumbnail:
      "../../public/course_img.jpg",
  },
  {
    course_id: 3,
    title: "올림픽공원 순환 코스",
    content: "광활한 공원길과 조각공원 옆을 도는 평지 코스.",
    star_average: 4.5,
    review_count: 64,
    distance: 4.3,
    is_bookmarked: false,
    thumbnail:
      "../../public/course_img.jpg",
  },
  {
    course_id: 4,
    title: "북서울 꿈의숲 러닝 코스",
    content: "조용하고 여유로운 분위기의 숲속 러닝로!",
    star_average: 4.8,
    review_count: 51,
    distance: 2.9,
    is_bookmarked: false,
    thumbnail:
      "../../public/course_img.jpg",
  },
];

// 📍 작성한 리뷰 목록 (ReviewMy.jsx용)
export const mockMyReviews = [
  {
    review_id: 12,
    course_id: 3,
    course_title: "한강 반포 러닝 코스",
    course_thumbnail: "../../public/course_img.jpg",
    rating: 4.0,
    content: "언제든 달리기하기 좋아요. 대신 여름엔 날벌레가 좀 많은 편이에요.",
    review_date: "2025.10.06",
    course_star_average: 4.9,
    course_review_count: 100,
    course_distance: 5.0,
  },
  {
    review_id: 15,
    course_id: 5,
    course_title: "올림픽공원 트랙 코스",
    course_thumbnail: "../../public/course_img.jpg",
    rating: 5.0,
    content: "도심 속에서 조용히 달릴 수 있는 최적의 코스예요.",
    review_date: "2025.10.04",
    course_star_average: 4.8,
    course_review_count: 57,
    course_distance: 4.0,
  },
];


// 이미 파일이 있다면, 아래 export만 추가하세요.
// 없다면 새로 만들어도 됩니다.

export const mockMyWrittenReviews = [
  {
    review_id: 12,
    course_id: 3,
    course_title: "한강 반포 러닝 코스",
    course_thumbnail: "../../public/course_img.jpg",
    rating: 4.0,
    content: "언제든 달리기하기 좋아요. 다만 여름엔 날벌레가 좀 많은 편이에요.",
    review_date: "2025.10.06",
    course_star_average: 4.9,
    course_review_count: 100,
    course_distance: 5.0,
  },
  {
    review_id: 18,
    course_id: 4,
    course_title: "올림픽공원 트랙 코스",
    course_thumbnail: "../../public/course_img.jpg",
    rating: 5.0,
    content: "트랙 상태가 정말 깔끔해서 인터벌 하기 최고!",
    review_date: "2025.10.05",
    course_star_average: 4.7,
    course_review_count: 58,
    course_distance: 4.0,
  },
  {
    review_id: 21,
    course_id: 7,
    course_title: "북서울 꿈의숲 파크런",
    course_thumbnail: "../../public/course_img.jpg",
    rating: 3.0,
    content: "가볍게 조깅하기엔 좋은데 주말엔 사람이 많아요.",
    review_date: "2025.09.30",
    course_star_average: 4.3,
    course_review_count: 22,
    course_distance: 3.5,
  },
];
