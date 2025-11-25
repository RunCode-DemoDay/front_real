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
import html2canvas from "html2canvas";
import { getPresignedUrl } from "../../api/archivingAPI";
import axios from "axios";


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


function mmss(sec = 0) {
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(Math.floor(sec % 60)).padStart(2, "0");
  return `${m}:${s}`;
}


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


  console.log("========================================");
  console.log("%c[RunningStop] MOUNT", "color: #009688; font-weight: bold;");
  console.log(
    "%c[RunningStop] useParams().courseId:",
    "color: #009688",
    courseId
  );
  console.log("%c[RunningStop] location.state:", "color: #009688", state);
  console.log("========================================");

  const bpm = state?.bpm ?? null;
  const courseTitle = state?.courseTitle ?? "";
  const star_average = state?.star_average ?? null;
  const review_count = state?.review_count ?? null;
  const courseDistance = state?.courseDistance ?? null;

  console.log("%c[RunningStop] state에서 파생된 값:", "color: #00796b", {
    bpm,
    courseTitle,
    star_average,
    review_count,
    courseDistance,
  });

  const [elapsedSec, setElapsedSec] = useState(0);
  const [totalDistanceKm, setTotalDistanceKm] = useState(0);
  const [path, setPath] = useState([]);
  const [currentPos, setCurrentPos] = useState(null);
  const [isRunning, setIsRunning] = useState(true);

  const mapRef = useRef(null);
  const mapCaptureRef = useRef(null); // 캡처할 지도 영역
  const lastPosRef = useRef(null);

  // courseId 유효성 검사
  useEffect(() => {
    console.log(
      "%c[RunningStop] courseId 유효성 검사 useEffect, courseId = " + courseId,
      "color: #e91e63"
    );

    if (!courseId || courseId === "null") {
      alert("잘못된 접근입니다. 코스를 선택하고 러닝을 시작해주세요.");
      navigate("/home", { replace: true });
    }
  }, [courseId, navigate]);

 
  useEffect(() => {
    console.log(
      "%c[RunningStop] 시간 타이머 useEffect, isRunning = " + isRunning,
      "color: #3f51b5"
    );
    if (!isRunning) return;
    const timer = setInterval(() => {
      setElapsedSec((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning]);

  // 위치 추적
  useEffect(() => {
    console.log(
      "%c[RunningStop] 위치 추적 useEffect, isRunning = " + isRunning,
      "color: #9c27b0"
    );
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
      (err) => {
        console.error("[RunningStop] 위치 추적 에러:", err);
      },
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

  const handleToggle = () => {
    console.log(
      "%c[RunningStop] 재생/일시정지 토글 클릭, isRunning = " + isRunning,
      "color: #ff9800"
    );
    setIsRunning((prev) => !prev);
  };

  // 정지 → 지도 캡처 → S3 업로드 → draftArchiving 생성 → 사진촬영 페이지로 이동
  const handleStop = async () => {
    console.log("%c[RunningStop] 정지 버튼 클릭", "color: #f44336");
    console.log("%c[RunningStop] 현재 courseId:", "color: #f44336", courseId);
    console.log(
      "%c[RunningStop] 현재 경로(path) 길이:",
      "color: #f44336",
      path.length
    );

    setIsRunning(false);

    try {
      let detailImageUrl = "";

      
      if (mapCaptureRef.current) {
        console.log("[RunningStop] html2canvas로 지도 캡처 시작");
        const canvas = await html2canvas(mapCaptureRef.current, {
          useCORS: true,
          backgroundColor: null,
          scale: 2,
        });

        const blob = await new Promise((resolve, reject) =>
          canvas.toBlob(
            (b) => (b ? resolve(b) : reject(new Error("지도 캡처 실패"))),
            "image/png",
            0.9
          )
        );
        console.log("[RunningStop] 지도 캡처 blob 생성 완료:", blob);

        
        const fileName = `archivings_${Date.now()}.png`;
        const contentType = "image/png";

        console.log("백엔드에 Presigned URL을 요청합니다...", {
          fileName,
          contentType,
        });
        const { presignedUrl, imageUrl } = await getPresignedUrl(
          fileName,
          contentType
        );
        console.log("[RunningStop] presignedUrl:", presignedUrl);
        console.log("[RunningStop] imageUrl(쿼리 제거 본체):", imageUrl);

       
        console.log("S3에 이미지 업로드를 시작합니다...");
        await axios.put(presignedUrl, blob, {
          headers: { "Content-Type": contentType },
        });
        console.log("S3 업로드 성공!");

       
        detailImageUrl = imageUrl;
      } else {
        console.warn(
          "지도 캡처 영역을 찾지 못했습니다. detailImage 없이 저장됩니다."
        );
      }

     
      const laps = [];
      if (path.length > 1) {
        let lapDistance = 0;
        let lapStartTime = 0;
        let lastLapPaceSec = 0;

        for (let i = 1; i < path.length; i++) {
          const segmentDistance = haversineKm(path[i - 1], path[i]);
          lapDistance += segmentDistance;

          if (lapDistance >= 1 || i === path.length - 1) {
            const currentTotalTime = elapsedSec;
            const lapTime = currentTotalTime - lapStartTime;

            const lapPaceSec =
              lapDistance > 0 ? Math.round(lapTime / lapDistance) : 0;
            const paceMin = Math.floor(lapPaceSec / 60);
            const paceSec = String(lapPaceSec % 60).padStart(2, "0");

            let paceVariation = "-";
            if (laps.length > 0 && lastLapPaceSec > 0) {
              const diff = lapPaceSec - lastLapPaceSec;
              const sign = diff >= 0 ? "+" : "-";
              const diffMin = Math.floor(Math.abs(diff) / 60);
              const diffSec = String(Math.abs(diff) % 60).padStart(2, "0");
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

      if (laps.length === 0 && totalDistanceKm > 0) {
        const avgPaceSec = Math.round(elapsedSec / totalDistanceKm);
        const paceMin = Math.floor(avgPaceSec / 60);
        const paceSec = String(avgPaceSec % 60).padStart(2, "0");
        laps.push({
          lap_number: 1,
          average_pace: `${paceMin}'${paceSec}"`,
          pace_variation: "-",
          altitude: path.length > 0 ? path[path.length - 1].alt : 0,
        });
      }

      console.log("[RunningStop] 최종 laps 데이터:", laps);

      // 5) 시간 포맷 (HH:mm:ss)
      const timeStr = new Date(elapsedSec * 1000).toISOString().substr(11, 8);

      // 6) 아카이빙 초안(draft) 데이터만 생성해서 Picture 페이지로 넘김
      const draftArchiving = {
        content: "",
        course_id: Number(courseId),
        title: `${new Date().toISOString().split("T")[0]} 러닝 기록`,
        detailImage: detailImageUrl || "",
        // thumbnail은 아직 없음 (카메라 사진 찍고 결정)
        distance: totalDistanceKm || 0,
        calorie: 0,
        average_pace: avgPace,
        time: timeStr,
        altitude: 0,
        cadence: 0,
        laps,
      };

      console.log("[RunningStop] draftArchiving:", draftArchiving);

      // 7) 사진 촬영 페이지로 이동 (POST는 거기서 한 번만)
      navigate("/archiving/picture", {
        replace: true,
        state: {
          fromRunning: true,
          draftArchiving,
        },
      });
    } catch (error) {
      console.error("draft 아카이빙 생성 준비에 실패했습니다.", error);
      console.log("서버 응답:", error.response?.data);
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
            
            <button
              className="ctrl-btn black"
              onClick={handleStop}
              aria-label="종료"
            >
              <img src={ICONS.stop} alt="종료" />
            </button>

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
