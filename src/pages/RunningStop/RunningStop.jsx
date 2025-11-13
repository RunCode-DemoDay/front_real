// src/pages/RunningStop/RunningStop.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { GoogleMap, useLoadScript, MarkerF, PolylineF } from "@react-google-maps/api";
import "./RunningStop.css";

// 아이콘
const ICONS = {
  play: "https://runcode-likelion.s3.us-east-2.amazonaws.com/running/play.svg",
  pause: "https://runcode-likelion.s3.us-east-2.amazonaws.com/running/pause.svg",
  stop: "https://runcode-likelion.s3.us-east-2.amazonaws.com/running/stop.svg",
  location: "https://runcode-likelion.s3.us-east-2.amazonaws.com/running/location.svg",
};

const LOCATION_ICON_SIZE = 18;
const LOCATION_ICON_ANCHOR = Math.floor(LOCATION_ICON_SIZE / 2);

// Google Maps API
const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY;
const libraries = ["places"];

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
  keyboardShortcuts: false,
  styles: [
    { featureType: "all", elementType: "labels.text.fill", stylers: [{ color: "#4A4A4A" }] },
    { featureType: "all", elementType: "labels.text.stroke", stylers: [{ visibility: "on" }, { color: "#ffffff" }, { weight: 2 }] },
    { featureType: "all", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#2C2C2C" }, { lightness: 0 }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#4A4A4A" }, { lightness: 0 }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#4A4A4A" }] },
    { featureType: "road.highway", elementType: "geometry.fill", stylers: [{ color: "#4A4A4A" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ visibility: "off" }] },
    { featureType: "poi", elementType: "all", stylers: [{ visibility: "off" }] },
    { featureType: "transit", elementType: "all", stylers: [{ visibility: "off" }] },
  ],
};

// 시간 포맷
function mmss(sec = 0) {
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(Math.floor(sec % 60)).padStart(2, "0");
  return `${m}:${s}`;
}

// 구면거리
function haversineKm(a, b) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export default function RunningStop() {
  const { courseId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  // 백에서 넘어온 정보
  const bpm = state?.bpm ?? null;
  const courseTitle = state?.courseTitle ?? "";
  const star_average = state?.star_average ?? null;
  const review_count = state?.review_count ?? null;
  const courseDistance = state?.courseDistance ?? null;

  // 러닝 상태
  const [elapsedSec, setElapsedSec] = useState(0);
  const [totalDistanceKm, setTotalDistanceKm] = useState(0);
  const [path, setPath] = useState([]);
  const [currentPos, setCurrentPos] = useState(null);
  const [isRunning, setIsRunning] = useState(true); // 들어오자마자 "달리는 중" → pause 아이콘 보여주기

  const mapRef = useRef(null);
  const lastPosRef = useRef(null);

  // 시간 증가
  useEffect(() => {
    if (!isRunning) return;
    const timer = setInterval(() => setElapsedSec((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, [isRunning]);

  // 위치 추적
  useEffect(() => {
    if (!navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const p = { lat: latitude, lng: longitude };
        const now = Date.now();

        if (!lastPosRef.current) {
          lastPosRef.current = { ...p, t: now };
          setCurrentPos(p);
          setPath([p]);
          if (mapRef.current) {
            mapRef.current.setZoom(16);
            mapRef.current.panTo(p);
          }
          return;
        }

        if (typeof accuracy === "number" && accuracy > 50) return;

        const prev = lastPosRef.current;
        const step = haversineKm(prev, p);

        // 2m 미만 or 100m 이상 튄 값 제거
        if (step < 0.002 || step > 0.1) {
          setCurrentPos(p);
          if (mapRef.current) mapRef.current.panTo(p);
          return;
        }

        if (isRunning) {
          setTotalDistanceKm((d) => d + step);
          setPath((prevPath) => [...prevPath, p]);
        }

        lastPosRef.current = { ...p, t: now };
        setCurrentPos(p);
        if (mapRef.current) mapRef.current.panTo(p);
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [isRunning]);

  const center = useMemo(
    () => currentPos ?? { lat: 37.5665, lng: 126.978 },
    [currentPos]
  );

  const avgPace = useMemo(() => {
    const dist = Number(totalDistanceKm);
    if (!dist || dist < 0.02) return "-'--\"";
    const secPerKm = Math.round(elapsedSec / dist);
    const m = Math.floor(secPerKm / 60);
    const s = String(secPerKm % 60).padStart(2, "0");
    return `${m}'${s}"`;
  }, [elapsedSec, totalDistanceKm]);

  // ▶/⏸ 토글
  const handleToggle = () => {
    setIsRunning((prev) => !prev);
  };

  // 정지 → 아카이빙
  const handleStop = () => {
    setIsRunning(false);
    navigate("/archiving/picture", {
      replace: true,
      state: {
        distanceKm: totalDistanceKm,
        elapsedSec,
        bpm,
        courseId: courseId === "null" ? null : courseId,
        courseTitle,
        star_average,
        review_count,
        courseDistance,
        fromRunning: true,
        path,
      },
    });
  };

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_KEY,
    libraries,
  });

  if (loadError) {
    return (
      <div className="runningstop-page">
        <div className="map-fallback">지도를 불러오지 못했어요.</div>
      </div>
    );
  }

  return (
    <div className="runningstop-page">
      {/* 지도 영역 */}
      <div className="stop-map-wrap">
        {isLoaded ? (
          <GoogleMap
            mapContainerClassName="stop-map"
            center={center}
            zoom={13}
            options={mapOptions}
            onLoad={(m) => (mapRef.current = m)}
          >
            {path.length >= 2 && (
              <PolylineF
                path={path}
                options={{
                  geodesic: true,
                  strokeColor: "#FF003C",
                  strokeOpacity: 1,
                  strokeWeight: 4,
                }}
              />
            )}
            {currentPos && (
              <MarkerF
                position={currentPos}
                icon={{
                  url: ICONS.location,
                  scaledSize: new window.google.maps.Size(
                    LOCATION_ICON_SIZE,
                    LOCATION_ICON_SIZE
                  ),
                  anchor: new window.google.maps.Point(
                    LOCATION_ICON_ANCHOR,
                    LOCATION_ICON_ANCHOR
                  ),
                }}
              />
            )}
          </GoogleMap>
        ) : (
          <div className="map-fallback">지도를 불러오는 중…</div>
        )}
      </div>

      {/* 하단 패널 */}
      <div className="stop-panel">
        <div className="stop-stats">
          <div className="stat">
            <div className="v">{mmss(elapsedSec)}</div>
            <div className="k">시간</div>
          </div>
          <div className="stat">
            <div className="v">{totalDistanceKm.toFixed(2)}</div>
            <div className="k">km</div>
          </div>
          <div className="stat">
            <div className="v">{avgPace}</div>
            <div className="k">페이스</div>
          </div>
        </div>

        <div className="stop-controls">
          {/* 정지 버튼 */}
          <button className="ctrl-btn black" onClick={handleStop} aria-label="종료">
            <img src={ICONS.stop} alt="종료" />
          </button>

          {/* 플레이/일시정지 토글 버튼 */}
          <button
            className="ctrl-btn red"
            onClick={handleToggle}
            aria-label={isRunning ? "일시정지" : "시작"}
          >
            <img src={isRunning ? ICONS.pause : ICONS.play} alt={isRunning ? "일시정지" : "시작"} />
          </button>
        </div>
      </div>
    </div>
  );
}
