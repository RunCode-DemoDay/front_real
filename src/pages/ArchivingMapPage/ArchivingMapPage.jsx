// src/pages/ArchivingMapPage/ArchivingMapPage.jsx

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import AppContainer from "../../AppContainer/AppContainer";
import "./ArchivingMapPage.css";
import BottomNavigator from "../../component/BottomNavigator/BottomNavigator";
import { GoogleMap, useLoadScript, MarkerF } from "@react-google-maps/api";
import { useNavigate } from "react-router-dom";

// Google Maps API 키
const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY;
const libraries = ["places"];

// --- 아이콘 및 에셋 ---
const ASSET_ICONS = {
  marker:
    "https://runcode-likelion.s3.us-east-2.amazonaws.com/archiving/marker.svg",
  map_on:
    "https://runcode-likelion.s3.us-east-2.amazonaws.com/archiving/map_on.svg",
  map_off:
    "https://runcode-likelion.s3.us-east-2.amazonaws.com/archiving/map_off.svg",
  list_on:
    "https://runcode-likelion.s3.us-east-2.amazonaws.com/archiving/list_on.svg",
  list_off:
    "https://runcode-likelion.s3.us-east-2.amazonaws.com/archiving/list_off.svg",
  bookmark:
    "https://runcode-likelion.s3.us-east-2.amazonaws.com/course/review.svg",
  star: 'https://runcode-likelion.s3.us-east-2.amazonaws.com/course/star.svg',
  distance:
    "https://runcode-likelion.s3.us-east-2.amazonaws.com/course/detail/distance.svg",
  // ✅ 현재 위치 아이콘 (지금은 안 씀)
  location:
    "https://runcode-likelion.s3.us-east-2.amazonaws.com/running/location.svg",
};

// ---------------------- 가짜 API (임시) ----------------------

const fetchArchivedCourses = async () => {
  return [
    {
      course_id: 1,
      title: "한강 반포 코스",
      location: {
        latitude: 37.5135,
        longitude: 127.005,
        locationType: "START",
      },
    },
    {
      course_id: 2,
      title: "여의도 코스",
      location: {
        latitude: 37.525,
        longitude: 126.934,
        locationType: "START",
      },
    },
  ];
};

const fetchCourseSummary = async (courseId) => {
  return {
    course_id: courseId,
    title: "한강 반포 – 잠수교 순환",
    thumbnail: "../../public/course_img.jpg",
    star_average: 4.9,
    review_count: 100,
    distance: 5.0,
  };
};

const fetchCourseArchivings = async (courseId) => {
  return [
    {
      archiving_id: 1,
      date: "2025.10.06",
      title: "강한 자는 추석 연휴에도 달린다.",
      thumbnail: "../../public/course_detail.png",
      distance: 2.0,
      average_pace: "5'45\"",
      time: "11:31",
    },
    {
      archiving_id: 2,
      date: "2025.10.05",
      title: "가볍게 뛰기 좋은 날",
      thumbnail: "../../public/course_detail.png",
      distance: 5.0,
      average_pace: "6'00\"",
      time: "20:00",
    },
  ];
};

// ---------------------- 하위 UI 컴포넌트 ----------------------

const ArchivingListItem = ({ archiving, onClick }) => {
  const {
    date,
    title,
    thumbnail,
    distance,
    average_pace,
    time,
    archiving_id,
  } = archiving;

  const formattedDistance = distance ? distance.toFixed(2) : "0.00";
  const formatPace = (pace) =>
    average_pace ? average_pace.replace(/"/g, "'") : "0'00\"";

  return (
    <div
      className="archiving-list-item"
      onClick={() => onClick(archiving_id)}
    >
      <p className="archiving-date">{date}</p>
      <h3 className="archiving-title">{title}</h3>

      <div className="list-item-details">
        <div className="map-thumbnail-container">
          {thumbnail && <img src={thumbnail} alt={title} />}
        </div>

        <div className="detail-columns">
          <div className="detail-item">
            <span className="value">{formattedDistance}</span>
            <span className="label">km</span>
          </div>
          <div className="detail-item">
            <span className="value">{formatPace(average_pace)}</span>
            <span className="label">평균 페이스</span>
          </div>
          <div className="detail-item">
            <span className="value">{time}</span>
            <span className="label">시간</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ArchivingListContent = ({ archivingList, onItemClick }) => (
  <div className="arc-map-card-scroll-content">
    {archivingList && archivingList.length > 0 ? (
      archivingList.map((archiving) => (
        <ArchivingListItem
          key={archiving.archiving_id}
          archiving={archiving}
          onClick={onItemClick}
        />
      ))
    ) : (
      <div
        style={{
          padding: "20px",
          color: "#ccc",
          textAlign: "center",
        }}
      >
        해당 코스의 아카이빙 기록이 없습니다.
      </div>
    )}
  </div>
);

const ArchivingSummaryCard = ({
  courseDetail,
  archivingList,
  isVisible,
  style,
  onDragStart,
  onArchivingItemClick,
}) => {
  if (!archivingList || !courseDetail) {
    return (
      <div
        className={`arc-map-summary-card ${
          isVisible ? "card-visible" : ""
        }`}
        style={style}
      />
    );
  }

  const {
    title,
    thumbnail,
    star_average,
    review_count,
    distance,
  } = courseDetail;
  const formattedDistance = distance ? distance.toFixed(1) : "0.0";

  return (
    <div
      className={`arc-map-summary-card ${isVisible ? "card-visible" : ""}`}
      style={style}
    >
      <div
        className="arc-map-drag-handle"
        onTouchStart={onDragStart}
        onMouseDown={onDragStart}
      />
      <div
        className="archiving-course-info"
        style={{
          marginBottom: "0",
          paddingBottom: "12px",
          borderBottom: "1px solid #505050",
        }}
      >
        <div className="course-thumbnail">
          {thumbnail && (
            <img
              src={thumbnail}
              alt={title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          )}
        </div>
        <div className="course-text-content">
          <h2 className="course-title">{title || "코스 정보 없음"}</h2>

          <div className="course-meta">
            <span className="star-rating">
              <img src={ASSET_ICONS.star} alt="star" className="icon1" />{" "}
              {star_average || "0.0"}
            </span>
            <span className="review-count">
              <img
                src={ASSET_ICONS.bookmark}
                alt="bookmark"
                className="icon"
              />
              리뷰 {review_count || "0"}건
            </span>
            <span className="distance">
              <img
                src={ASSET_ICONS.distance}
                alt="distance"
                className="icon1"
              />{" "}
              {formattedDistance}km
            </span>
          </div>
        </div>
      </div>

      <ArchivingListContent
        archivingList={archivingList}
        onItemClick={onArchivingItemClick}
      />
    </div>
  );
};

// ---------------------- 메인 페이지 컴포넌트 ----------------------

function ArchivingMapPage() {
  const [courseList, setCourseList] = useState([]);
  const [selectedCourseDetail, setSelectedCourseDetail] = useState(null);
  const [archivingList, setArchivingList] = useState(null);
  const [loading, setLoading] = useState(true);

  // 현재 위치는 계속 관리하긴 함 (센터 맞추려고)
  const [currentPos, setCurrentPos] = useState(null);
  const [geoError, setGeoError] = useState(null);

  const mapRef = useRef(null);

  const NAV_HEIGHT = 200;
  const INITIAL_CARD_HEIGHT = 200;
  const MAX_CARD_TOP = 90;
  const [cardTopPosition, setCardTopPosition] = useState(
    window.innerHeight || 800
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);

  const navigate = useNavigate();

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_KEY,
    libraries: libraries,
  });

  const mapCenter = useMemo(() => {
    if (currentPos) {
      return currentPos;
    }
    if (courseList.length > 0) {
      return {
        lat: parseFloat(courseList[0].location.latitude),
        lng: parseFloat(courseList[0].location.longitude),
      };
    }
    return { lat: 37.5665, lng: 126.978 };
  }, [currentPos, courseList]);

  const handleViewArchivings = useCallback(() => {
    navigate("/archiving/list");
  }, [navigate]);

  const handleViewArchivingDetail = useCallback(() => {
    navigate("/archiving/map");
  }, [navigate]);

  const handleArchivingItemClick = useCallback(
    (archivingId) => {
      navigate(`/archiving/${archivingId}`);
    },
    [navigate]
  );

  const options = useMemo(
    () => ({
      disableDefaultUI: true,
      zoomControl: false,
      styles: [
        {
          featureType: "all",
          elementType: "labels.text.fill",
          stylers: [{ color: "#4A4A4A" }],
        },
        {
          featureType: "all",
          elementType: "labels.text.stroke",
          stylers: [
            { visibility: "on" },
            { color: "#ffffff" },
            { weight: 2 },
          ],
        },
        {
          featureType: "all",
          elementType: "labels.icon",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "landscape",
          elementType: "geometry",
          stylers: [{ color: "#2C2C2C" }, { lightness: 0 }],
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#4A4A4A" }, { lightness: 0 }],
        },
        {
          featureType: "administrative.land_parcel",
          elementType: "geometry",
          stylers: [{ color: "#4A4A4A" }],
        },
        {
          featureType: "landscape.natural",
          elementType: "geometry",
          stylers: [{ color: "#2C2C2C" }],
        },
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [{ color: "#4A4A4A" }],
        },
        {
          featureType: "road.highway",
          elementType: "geometry.fill",
          stylers: [{ color: "#4A4A4A" }],
        },
        {
          featureType: "road",
          elementType: "geometry.stroke",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "road.highway",
          elementType: "geometry.stroke",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "administrative",
          elementType: "geometry.stroke",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "administrative.land_parcel",
          elementType: "geometry.stroke",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "poi",
          elementType: "all",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "transit",
          elementType: "all",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "administrative.locality",
          elementType: "labels.text.fill",
          stylers: [{ color: "#4A4A4A" }],
        },
        {
          featureType: "administrative.neighborhood",
          elementType: "labels.text.fill",
          stylers: [{ color: "#4A4A4A" }],
        },
      ],
    }),
    []
  );

  const handleMapClick = useCallback(() => {
    if (selectedCourseDetail) {
      setSelectedCourseDetail(null);
      setArchivingList(null);
    }
  }, [selectedCourseDetail]);

  const handleMarkerClick = useCallback(
    async (course) => {
      if (
        selectedCourseDetail &&
        selectedCourseDetail.course_id === course.course_id
      ) {
        setSelectedCourseDetail(null);
        setArchivingList(null);
      } else {
        try {
          const courseDetail = await fetchCourseSummary(course.course_id);
          setSelectedCourseDetail(courseDetail);

          const list = await fetchCourseArchivings(course.course_id);
          setArchivingList(list);

          if (mapRef.current) {
            mapRef.current.panTo({
              lat: parseFloat(course.location.latitude),
              lng: parseFloat(course.location.longitude),
            });
          }
        } catch (error) {
          console.error(
            `데이터 로딩 실패 (ID: ${course.course_id}):`,
            error
          );
          setSelectedCourseDetail(null);
          setArchivingList(null);
        }
      }
      setIsAnimating(true);
    },
    [selectedCourseDetail]
  );

  const handleDragStart = useCallback(
    (e) => {
      if (!selectedCourseDetail) return;
      if (e.target.closest(".arc-map-drag-handle")) {
        setIsDragging(true);
        setIsAnimating(false);
      }
    },
    [selectedCourseDetail]
  );

  const handleDragging = useCallback(
    (e) => {
      if (!isDragging) return;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const newTop = clientY;

      const minTop = MAX_CARD_TOP;
      const maxTop = window.innerHeight - NAV_HEIGHT;

      if (newTop >= minTop && newTop <= maxTop) {
        setCardTopPosition(newTop);
      }

      e.preventDefault();
    },
    [isDragging]
  );

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    setIsAnimating(true);

    const currentHeight = window.innerHeight - cardTopPosition;
    const SNAP_TO_CLOSE_HEIGHT = 80;

    if (currentHeight < SNAP_TO_CLOSE_HEIGHT) {
      setSelectedCourseDetail(null);
      setArchivingList(null);
    }
  }, [isDragging, cardTopPosition]);

  useEffect(() => {
    document.addEventListener("mousemove", handleDragging);
    document.addEventListener("mouseup", handleDragEnd);
    document.addEventListener("touchmove", handleDragging, {
      passive: false,
    });
    document.addEventListener("touchend", handleDragEnd);

    return () => {
      document.removeEventListener("mousemove", handleDragging);
      document.removeEventListener("mouseup", handleDragEnd);
      document.removeEventListener("touchmove", handleDragging);
      document.removeEventListener("touchend", handleDragEnd);
    };
  }, [handleDragging, handleDragEnd]);

  useEffect(() => {
    if (!selectedCourseDetail) {
      setIsAnimating(true);
      setCardTopPosition(window.innerHeight);
    } else if (!isDragging && cardTopPosition === window.innerHeight) {
      setIsAnimating(true);
      setCardTopPosition(
        window.innerHeight - INITIAL_CARD_HEIGHT - NAV_HEIGHT
      );
    }
  }, [selectedCourseDetail, isDragging, cardTopPosition]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchArchivedCourses();
        setCourseList(data);
      } catch (error) {
        console.error("코스 목록 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError("이 기기에서는 위치 서비스를 지원하지 않아요.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const firstPos = { lat: latitude, lng: longitude };

        setCurrentPos(firstPos);

        if (mapRef.current) {
          mapRef.current.panTo(firstPos);
          mapRef.current.setZoom(16);
        }

        setGeoError(null);
      },
      (err) => {
        console.error("초기 위치를 가져올 수 없습니다:", err);
        if (err.code === 1) {
          setGeoError("위치 권한이 거부되었습니다.");
        } else if (err.code === 2) {
          setGeoError("현재 위치를 확인할 수 없어요.");
        } else if (err.code === 3) {
          setGeoError("위치 요청 시간 초과.");
        } else {
          setGeoError("위치를 가져오는 중 문제가 발생했어요.");
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      }
    );

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const newPos = { lat: latitude, lng: longitude };

        setCurrentPos((prev) => {
          if (!prev && mapRef.current) {
            mapRef.current.panTo(newPos);
            mapRef.current.setZoom(16);
          }
          return newPos;
        });

        setGeoError(null);
      },
      (err) => {
        console.error("실시간 위치를 가져올 수 없습니다:", err);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  if (loadError) {
    return (
      <AppContainer>
        <div className="arc-map-loading-screen">
          Google Map 로드 오류: {loadError.message}
        </div>
      </AppContainer>
    );
  }

  if (!isLoaded || loading) {
    return (
      <AppContainer>
        <div className="arc-map-loading-screen">데이터 및 지도 로딩 중...</div>
      </AppContainer>
    );
  }

  const isCardVisible =
    !!selectedCourseDetail && !!(archivingList && archivingList.length);

  return (
    <AppContainer>
      <div className="arc-map-container">
        {geoError && (
          <div
            style={{
              position: "absolute",
              top: "64px",
              right: "16px",
              background: "rgba(0,0,0,0.7)",
              color: "#fff",
              padding: "8px 12px",
              borderRadius: "8px",
              fontSize: "12px",
              lineHeight: 1.4,
              maxWidth: "180px",
              zIndex: 9999,
            }}
          >
            {geoError}
          </div>
        )}

        <header className="arc-map-header">
          <h1 className="header-title">나의 런코드</h1>
          <div className="header-icons">
            <button
              className="header-icon-button-map"
              onClick={handleViewArchivingDetail}
            >
              <img src={ASSET_ICONS.map_on} alt="기록 상세" className="icon" />
            </button>
            <button
              className="header-icon-button-list"
              onClick={handleViewArchivings}
            >
              <img
                src={ASSET_ICONS.list_off}
                alt="전체 목록"
                className="icon"
              />
            </button>
          </div>
        </header>

        <div className="arc-map-area">
          <GoogleMap
            mapContainerClassName="arc-map-full-size"
            center={mapCenter}
            zoom={13}
            options={options}
            onClick={handleMapClick}
            onLoad={(mapInstance) => {
              mapRef.current = mapInstance;
            }}
          >
            {courseList.map((course) => (
              <MarkerF
                key={course.course_id}
                position={{
                  lat: parseFloat(course.location.latitude),
                  lng: parseFloat(course.location.longitude),
                }}
                onClick={() => handleMarkerClick(course)}
                icon={{
                  url: ASSET_ICONS.marker,
                  scaledSize: new window.google.maps.Size(24, 31),
                  anchor: new window.google.maps.Point(14, 40),
                }}
              />
            ))}
            {/* ✅ 현재 위치는 추적만 하고, 지도에는 표시하지 않음 */}
          </GoogleMap>
        </div>

        <ArchivingSummaryCard
          courseDetail={selectedCourseDetail}
          archivingList={archivingList}
          isVisible={isCardVisible}
          style={{
            top: `${cardTopPosition}px`,
            transition: isAnimating ? "top 0.3s ease-out" : "none",
          }}
          onDragStart={handleDragStart}
          onArchivingItemClick={handleArchivingItemClick}
        />
      </div>

      <BottomNavigator className="arc-map-bottom-nav" />
    </AppContainer>
  );
}

export default ArchivingMapPage;
