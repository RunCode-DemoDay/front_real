import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "./RunningCount.css";

export default function RunningCount() {
  const { courseId } = useParams();
  const { state } = useLocation(); // CourseDetailPage에서 전달받은 모든 state
  const navigate = useNavigate();

  const [count, setCount] = useState(3);

  useEffect(() => {
    // 카운트가 0보다 작아지면 타이머를 멈춥니다.
    if (count < 1) return;

    // 1초마다 카운트를 1씩 감소시키는 타이머 설정
    const timer = setTimeout(() => {
      setCount(count - 1);
    }, 1000);

    // 카운트가 0이 되면 RunningStop 페이지로 이동합니다.
    if (count === 0) {
      if (navigator.vibrate) navigator.vibrate(80);
      // ✅ CourseDetailPage에서 받은 state를 그대로 전달합니다.
      navigate(`/running/stop/${courseId}`, { state, replace: true });
    }

    // 컴포넌트가 언마운트되거나 count가 변경되면 타이머를 정리합니다.
    return () => clearTimeout(timer);
  }, [count, courseId, state, navigate]);

  return (
    <div className="runningcount-wrapper" role="timer" aria-live="assertive">
      <div key={count} className="runningcount-number">
        {count}
      </div>
    </div>
  );
}
