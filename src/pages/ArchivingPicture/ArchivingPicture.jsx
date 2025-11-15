import React, { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ArchivingPicture.css";
import FixedBottomButton from "../../component/FixedBottomButton/FixedBottomButton";

export default function ArchivingPicture() {
  const navigate = useNavigate();
  const { state: locationState } = useLocation(); // 이전 페이지에서 전달받은 state
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false); // 업로드 상태를 관리할 state
  
  const images = [
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=60",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=60",
    "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=600&q=60",
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=60",
  ];

  // 무한루프용
  const loop = [...images, ...images];

  // ✅ '추억 기록하기' 버튼 클릭 시 파일 입력(카메라) 창을 띄움
  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  // ✅ 사용자가 사진을 찍고 확인했을 때 실행될 함수
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true); // 로딩 상태 시작

    // FileReader를 사용해 이미지 파일을 Data URL(base64)로 변환
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageDataUrl = e.target.result;
      const archivingId = locationState?.archivingId;

      if (!archivingId) {
        alert("기록 ID가 없어 상세 페이지로 이동할 수 없습니다.");
        setIsUploading(false);
        navigate('/home'); // 에러 발생 시 홈으로 이동
        return;
      }

      // 생성된 아카이빙의 상세 페이지로 이미지 데이터와 함께 이동
      navigate(`/archiving/${archivingId}`, {
        replace: true,
        state: {
          ...locationState, // fromRunning: true 등의 상태 유지
          newImage: imageDataUrl, // 새로 촬영한 이미지 데이터 전달
        },
      });
    };
    reader.onerror = (error) => {
      console.error("파일을 읽는 중 오류 발생:", error);
      alert("사진을 처리하는 데 실패했습니다. 다시 시도해주세요.");
      setIsUploading(false); // 오류 발생 시 업로드 상태 해제
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="archpic">
      {/* ✅ 숨겨진 파일 입력 엘리먼트 */}
      <input
        type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleFileChange} style={{ display: "none" }}
      />
      <div className="archpic-inner">
        <h1 className="archpic-title">
          오늘의 러닝을
          <br /> 사진으로 남겨볼까요?
        </h1>

        {/* 윗줄: 왼쪽 여백 60px에서 시작해서 왼쪽으로 */}
        <div className="archpic-lane lane-top">
          <div className="archpic-track" aria-hidden="true">
            {loop.map((src, i) => (
              <img key={`top-${i}`} src={src} alt="풍경" className="archpic-img" />
            ))}
          </div>
        </div>

        {/* 아랫줄: 오른쪽 여백 100px에서 시작해서 오른쪽으로 */}
        <div className="archpic-lane lane-bottom">
          <div className="archpic-track" aria-hidden="true">
            {loop.map((src, i) => (
              <img key={`bottom-${i}`} src={src} alt="풍경" className="archpic-img" />
            ))}
          </div>
        </div>
      </div>

      <FixedBottomButton
        label={isUploading ? "처리 중..." : "추억 기록하기"}
        onClick={handleButtonClick}
        backgroundColor="#FF004E"
        disabled={isUploading} // 업로드 중에는 버튼 비활성화
      />
    </div>
  );
}
