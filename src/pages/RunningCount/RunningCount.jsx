// src/pages/RunningCount/RunningCount.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import AppContainer from "../../AppContainer/AppContainer"; 
import "./RunningCount.css";

export default function RunningCount() {
  const { courseId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [count, setCount] = useState(3);

  useEffect(() => {
    console.log("========================================");
    console.log("%c[RunningCount] MOUNT", "color: #2196f3; font-weight: bold;");
    console.log(
      "%c[RunningCount] useParams().courseId:",
      "color: #2196f3",
      courseId
    );
    console.log("%c[RunningCount] location.state:", "color: #2196f3", state);
    console.log("========================================");
  }, []);

  useEffect(() => {
    console.log(
      "%c[RunningCount] useEffect 실행, count = " + count,
      "color: #3f51b5"
    );

    if (count === 0) {
      if (navigator.vibrate) navigator.vibrate(80);

      navigate(`/running/stop/${courseId}`, { state, replace: true });
      return;
    }

    const timer = setTimeout(() => {
      setCount(count - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [count, courseId, state, navigate]);

  return (
    <AppContainer>
      <div className="runningcount-wrapper" role="timer" aria-live="assertive">
        <div key={count} className="runningcount-number">
          {count}
        </div>
      </div>
    </AppContainer>
  );
}
