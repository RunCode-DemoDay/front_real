import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "./RunningActive.css";

const ICONS = {
  play: "https://runcode-likelion.s3.us-east-2.amazonaws.com/running/play.svg",
  pause: "https://runcode-likelion.s3.us-east-2.amazonaws.com/running/pause.svg",
};

function toMmSs(totalSec) {
  const m = Math.floor(totalSec / 60).toString().padStart(2, "0");
  const s = Math.floor(totalSec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function paceFromKmh(kmh) {
  if (!kmh || kmh <= 0) return `0'00"`;
  const secPerKm = 3600 / kmh;
  const m = Math.floor(secPerKm / 60);
  const s = Math.floor(secPerKm % 60).toString().padStart(2, "0");
  return `${m}'${s}"`;
}

function paceFromAvg(distanceKm, elapsedSec) {
  if (!distanceKm || distanceKm <= 0) return `-._.-`;
  const secPerKm = elapsedSec / distanceKm;
  const m = Math.floor(secPerKm / 60);
  const s = Math.floor(secPerKm % 60).toString().padStart(2, "0");
  return `${m}'${s}"`;
}

export default function RunningActive() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { state } = useLocation(); 
  const courseTitle = state?.courseTitle || "";

  const [elapsedSec, setElapsedSec] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0);
  const [bpm, setBpm] = useState(null);
  const [instantKmh, setInstantKmh] = useState(0);
  const emaRef = useRef(0);
  const alpha = 0.35;

  const timerRef = useRef(null);

 
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedSec((s) => s + 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);


  useEffect(() => {
    const onSpeed = (e) => {
      const v = Number(e?.detail?.kmh ?? 0);
      emaRef.current = alpha * v + (1 - alpha) * emaRef.current;
      setInstantKmh(emaRef.current);
    };
    const onDistance = (e) => {
      const d = Number(e?.detail?.km ?? 0);
      setDistanceKm(d);
    };
    const onBpm = (e) => {
      const b = e?.detail?.bpm;
      setBpm(b ?? null);
    };
    window.addEventListener("running:speed", onSpeed);
    window.addEventListener("running:distance", onDistance);
    window.addEventListener("running:bpm", onBpm);
    return () => {
      window.removeEventListener("running:speed", onSpeed);
      window.removeEventListener("running:distance", onDistance);
      window.removeEventListener("running:bpm", onBpm);
    };
  }, []);

 
  const realtimePace = useMemo(() => paceFromKmh(instantKmh), [instantKmh]);
  const avgPace = useMemo(
    () => paceFromAvg(distanceKm, elapsedSec),
    [distanceKm, elapsedSec]
  );

  
  const handlePauseClick = () => {
    clearInterval(timerRef.current);
    navigate(`/running/stop/${courseId}`, {
      state: {
        courseTitle,
        elapsedSec,
        distanceKm,
        bpm,
        instantKmh,
      },
    });
  };

  return (
    <div className="running-active-page">
      <div className="pace-current">
        <span className="pace-large">{realtimePace}</span>
        <span className="pace-caption">현재 페이스</span>
      </div>

      <div className="stats-row">
        <div className="stat">
          <div className="stat-value">{toMmSs(elapsedSec)}</div>
          <div className="stat-label">시간</div>
        </div>
        <div className="stat">
          <div className="stat-value">{bpm ?? "--"}</div>
          <div className="stat-label">BPM</div>
        </div>
        <div className="stat">
          <div className="stat-value">{avgPace}</div>
          <div className="stat-label">페이스</div>
        </div>
      </div>

      <div className="controls">
        <button
          className="btn-circle pause"
          onClick={handlePauseClick}
          aria-label="일시정지"
        >
          <img
            src={ICONS.pause}
            alt="일시정지"
            className="btn-icon"
          />
        </button>
      </div>
    </div>
  );
}
