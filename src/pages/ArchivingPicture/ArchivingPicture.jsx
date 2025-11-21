// src/pages/ArchivingPicture/ArchivingPicture.jsx
import React, { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ArchivingPicture.css";
import FixedBottomButton from "../../component/FixedBottomButton/FixedBottomButton";

export default function ArchivingPicture() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state; // 이전 페이지에서 전달받은 state
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const images = [
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=60",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=60",
    "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=600&q=60",
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=60",
  ];

  // 무한 루프용
  const loop = [...images, ...images];

  // '추억 기록하기' 버튼 클릭 시 파일 입력(카메라/갤러리) 열기
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 파일(사진) 선택 시 실행
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    const archivingId = locationState?.archivingId;

    if (!archivingId) {
      alert("기록 ID가 없어 상세 페이지로 이동할 수 없습니다.");
      setIsUploading(false);
      navigate("/home");
      return;
    }

    // ✅ 지금은 사진 데이터(Base64)로 PATCH 안 하고, 상세 페이지로만 이동
    navigate(`/archiving/${archivingId}`, {
      replace: true,
      state: {
        ...locationState,
        // newImage는 더 이상 사용하지 않음
      },
    });

    // 어차피 페이지 이동해서 의미는 거의 없지만, 혹시 모를 경우를 위해
    setIsUploading(false);
  };

  return (
    <div className="archpic">
      {/* 숨겨진 파일 입력 엘리먼트 */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      <div className="archpic-inner">
        <h1 className="archpic-title">
          오늘의 러닝을
          <br /> 사진으로 남겨볼까요?
        </h1>

        {/* 윗줄 */}
        <div className="archpic-lane lane-top">
          <div className="archpic-track" aria-hidden="true">
            {loop.map((src, i) => (
              <img
                key={`top-${i}`}
                src={src}
                alt="풍경"
                className="archpic-img"
              />
            ))}
          </div>
        </div>

        {/* 아랫줄 */}
        <div className="archpic-lane lane-bottom">
          <div className="archpic-track" aria-hidden="true">
            {loop.map((src, i) => (
              <img
                key={`bottom-${i}`}
                src={src}
                alt="풍경"
                className="archpic-img"
              />
            ))}
          </div>
        </div>
      </div>

      <FixedBottomButton
        label={isUploading ? "처리 중..." : "추억 기록하기"}
        onClick={handleButtonClick}
        backgroundColor="#FF004E"
        disabled={isUploading}
      />
    </div>
  );
}
