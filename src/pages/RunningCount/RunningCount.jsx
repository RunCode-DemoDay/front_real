import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./RunningCount.css";

export default function RunningCount() {
  const { courseId } = useParams(); // ✅ URL에서 courseId를 가져옵니다.
  const { state } = useLocation(); // CourseDetailPage에서 전달받은 모든 state
  const navigate = useNavigate();

  const [count, setCount] = useState(3);

  useEffect(() => {
    // ✅ 카운트가 0이 되면 RunningStop 페이지로 이동하고, 타이머 로직을 중단합니다.
    if (count === 0) {
      if (navigator.vibrate) navigator.vibrate(80);
      // ✅ 가져온 courseId를 URL에 포함하여 다음 페이지로 전달합니다.
      navigate(`/running/stop/${courseId}`, { state, replace: true });
      return;
    }

    // ✅ 카운트가 0보다 클 때만 1초마다 카운트를 1씩 감소시키는 타이머를 설정합니다.
    const timer = setTimeout(() => {
      setCount(count - 1);
    }, 1000);

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
