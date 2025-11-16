// src/pages/RunningStop/RunningStop.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  GoogleMap,
  useLoadScript,
  MarkerF,
  PolylineF,
} from "@react-google-maps/api";
import "./RunningStop.css";
import AppContainer from "../../AppContainer/AppContainer";
import html2canvas from "html2canvas"; // html2canvas 임포트
import { createArchiving, getPresignedUrl } from "../../api/archivingAPI"; // API 함수 임포트
import axios from 'axios'; // S3 업로드를 위해 axios 직접 사용

// 아이콘
const ICONS = {
  play: "https://runcode-likelion.s3.us-east-2.amazonaws.com/running/play.svg",
  pause:
    "https://runcode-likelion.s3.us-east-2.amazonaws.com/running/pause.svg",
  stop: "https://runcode-likelion.s3.us-east-2.amazonaws.com/running/stop.svg",
  location:
    "https://runcode-likelion.s3.us-east-2.amazonaws.com/running/location.svg",
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
    {
      featureType: "all",
      elementType: "labels.text.fill",
      stylers: [{ color: "#4A4A4A" }],
    },
    {
      featureType: "all",
      elementType: "labels.text.stroke",
      stylers: [{ visibility: "on" }, { color: "#ffffff" }, { weight: 2 }],
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
      featureType: "poi",
      elementType: "all",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "transit",
      elementType: "all",
      stylers: [{ visibility: "off" }],
    },
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
  const { courseId } = useParams(); // ✅ URL에서 courseId를 직접 가져옵니다.
  const { state } = useLocation(); // 코스 제목 등 추가 정보는 state에서 가져옵니다.
  const navigate = useNavigate();

  // 나머지 정보도 state에서 가져옵니다.
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
  const mapCaptureRef = useRef(null); // 캡처할 지도 영역을 위한 ref
  const lastPosRef = useRef(null);

  // ✅ 페이지 진입 시 courseId 유효성 검사
  useEffect(() => {
    // courseId가 없거나, "null"이라는 문자열이면 유효하지 않은 접근으로 간주
    if (!courseId || courseId === "null") {
      alert("잘못된 접근입니다. 코스를 선택하고 러닝을 시작해주세요.");
      // 홈 화면으로 돌려보냄
      navigate('/home', { replace: true });
    }
  }, [courseId, navigate]);

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
        const { latitude, longitude, accuracy, altitude } = pos.coords;
        const p = { lat: latitude, lng: longitude, alt: altitude ?? 0 };
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
  const handleStop = async () => {
    setIsRunning(false);

    // ✅ 최소 이동 거리 체크: 10m 미만은 저장하지 않음
    // if (totalDistanceKm < 0.01) {
    //   alert("이동 거리가 너무 짧아 기록을 저장할 수 없습니다.");
    //   navigate('/home', { replace: true }); // 홈으로 이동
    //   return;
    // }

    try {
      console.log("서버에 아카이빙 생성을 요청합니다.");

      let thumbnailUrl = null;
      // if (mapCaptureRef.current) {
      //   const canvas = await html2canvas(mapCaptureRef.current, { 
      //     useCORS: true,
      //     scale: 0.5 
      //   });
      //   const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));

      //   // 1. 백엔드에 Presigned URL 요청
      //   console.log("백엔드에 Presigned URL을 요청합니다...");
      //   const presignedResponse = await getPresignedUrl();
      //   if (!presignedResponse.success) throw new Error("Presigned URL 받기 실패");

      //   const { presignedUrl, imageUrl } = presignedResponse.data;
      //   console.log("Presigned URL 수신 완료.");

      //   // 2. 받은 URL로 S3에 이미지 업로드 (axios 직접 사용)
      //   console.log("S3에 이미지 업로드를 시작합니다...");
      //   await axios.put(presignedUrl, blob, { headers: { 'Content-Type': 'image/jpeg' } });
      //   console.log("S3 업로드 성공!");
      //   thumbnailUrl = imageUrl; // 최종 저장될 이미지 URL
      // } else {
      //   console.warn("지도 캡처에 실패했습니다.");
      // }

      // ✅ Laps 데이터 생성 로직 추가
      const laps = [];
      if (path.length > 1) {
        // 전체 거리가 0보다 클 때, 최소 1개의 랩을 보장하기 위한 로직
        // 1km 단위로 구간을 나누는 로직
        let lapDistance = 0;
        let lapStartTime = 0; // 구간 시작 시간 (초)
        let lastLapPaceSec = 0; // 이전 랩의 페이스(초)

        for (let i = 1; i < path.length; i++) {
          const segmentDistance = haversineKm(path[i - 1], path[i]);
          lapDistance += segmentDistance;

          if (lapDistance >= 1 || i === path.length - 1) {
            const currentTotalTime = elapsedSec;
            const lapTime = currentTotalTime - lapStartTime;

            const lapPaceSec = lapDistance > 0 ? Math.round(lapTime / lapDistance) : 0;
            const paceMin = Math.floor(lapPaceSec / 60);
            const paceSec = String(lapPaceSec % 60).padStart(2, '0');

            let paceVariation = "-";
            if (laps.length > 0 && lastLapPaceSec > 0) {
              const diff = lapPaceSec - lastLapPaceSec;
              const sign = diff >= 0 ? "+" : "-";
              const diffMin = Math.floor(Math.abs(diff) / 60);
              const diffSec = String(Math.abs(diff) % 60).padStart(2, '0');
              paceVariation = `${sign}${diffMin}'${diffSec}"`;
            }

            laps.push({
              lap_number: laps.length + 1,
              average_pace: `${paceMin}'${paceSec}"`,
              pace_variation: paceVariation,
              altitude: path[i].alt,
            });

            lapDistance = 0; 
            lapStartTime = currentTotalTime;
            lastLapPaceSec = lapPaceSec;
          }
        }
      }

      // ✅ Laps 배열이 비어있을 경우, 전체 기록을 하나의 Lap으로 만들어 최소 1개를 보장
      if (laps.length === 0 && totalDistanceKm > 0) {
        const avgPaceSec = Math.round(elapsedSec / totalDistanceKm);
        const paceMin = Math.floor(avgPaceSec / 60);
        const paceSec = String(avgPaceSec % 60).padStart(2, '0');
        laps.push({
          lap_number: 1,
          average_pace: `${paceMin}'${paceSec}"`,
          pace_variation: "-",
          altitude: path.length > 0 ? path[path.length - 1].alt : 0,
        });
      }

      const requestBody = {
        // ✅ 최종적으로 결정된 courseId를 숫자로 변환하여 사용합니다.
        course_id: 1,
        title: `${new Date().toISOString().split('T')[0]} 러닝 기록`, // 임시 제목
        distance: totalDistanceKm,
        time: new Date(elapsedSec * 1000).toISOString().substr(11, 8), // ✅ "HH:mm:ss" 형식으로 수정
        average_pace: avgPace,
        laps: laps,
        // ✅ 백엔드 명세서에 맞게 누락된 필드들을 기본값으로 추가합니다.
        content: "", // 메모 내용 (초기값은 빈 문자열)
        calorie: 0,
        altitude: 0,
        cadence: 0,
        detailImage: null, // 상세 이미지는 나중에 추가되므로 초기값은 null
      };

      // 2. 분리된 API 함수 호출
      const responseData = await createArchiving(requestBody);

      if (!responseData.success || !responseData.data?.archiving_id) {
        throw new Error(responseData.message || "아카이빙 생성 실패");
      }
      
      const newArchivingId = responseData.data.archiving_id;

      // 3. 응답받은 ID를 가지고 사진 촬영 페이지로 이동
      navigate(`/archiving/picture`, {
        replace: true,
        state: { 
          archivingId: newArchivingId,
          fromRunning: true, // 홈으로 가기 버튼 로직을 위해 유지
        },
      });
    } catch (error) {
      console.error("아카이빙 생성에 실패했습니다.", error);
      alert("기록 저장에 실패했습니다. 다시 시도해주세요.");
    }
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
    <AppContainer>
      <div className="runningstop-page">
        {/* 지도 영역 */}
        <div className="stop-map-wrap" ref={mapCaptureRef}>
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
            <button
              className="ctrl-btn black"
              onClick={handleStop}
              aria-label="종료"
            >
              <img src={ICONS.stop} alt="종료" />
            </button>

            {/* 플레이/일시정지 토글 버튼 */}
            <button
              className="ctrl-btn red"
              onClick={handleToggle}
              aria-label={isRunning ? "일시정지" : "시작"}
            >
              <img
                src={isRunning ? ICONS.pause : ICONS.play}
                alt={isRunning ? "일시정지" : "시작"}
              />
            </button>
          </div>
        </div>
      </div>
    </AppContainer>
  );
}
