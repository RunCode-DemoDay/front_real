import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "./RunningCount.css";

export default function RunningCount() {
  const { courseId } = useParams();
  const { state } = useLocation(); // { courseTitle }
  const navigate = useNavigate();

  const courseTitle = state?.courseTitle || "";
  const [count, setCount] = useState(3);

  const timerRef = useRef(null);
  const hasNavigatedRef = useRef(false);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCount((c) => (c > 1 ? c - 1 : 1));
    }, 850);
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (count === 1 && !hasNavigatedRef.current) {
      hasNavigatedRef.current = true;
      clearInterval(timerRef.current);
      setTimeout(() => {
        if (navigator.vibrate) navigator.vibrate(80);
        // ✅ 여기 수정됨
        navigate(`/running/stop/${courseId}`, {
          state: { courseTitle },
          replace: true,
        });
      }, 830);
    }
  }, [count, courseId, courseTitle, navigate]);

  return (
    <div className="runningcount-wrapper" role="timer" aria-live="assertive">
      <div key={count} className="runningcount-number">
        {count}
      </div>
    </div>
  );
}
