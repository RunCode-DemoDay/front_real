// src/pages/ArchivingPicture/ArchivingPicture.jsx
import React, { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ArchivingPicture.css";
import FixedBottomButton from "../../component/FixedBottomButton/FixedBottomButton";

import { getPresignedUrl, createArchiving } from "../../api/archivingAPI";
import axios from "axios";

export default function ArchivingPicture() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state; // { fromRunning, draftArchiving }
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  // draftArchiving 없으면 홈으로 보내기 (직접 URL로 들어온 경우 방지)
  useEffect(() => {
    if (!locationState?.draftArchiving) {
      alert("러닝 기록 정보가 없어 홈으로 이동합니다.");
      navigate("/home", { replace: true });
    }
  }, [locationState, navigate]);

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

  // 파일(사진) 선택 시 실행 → S3 업로드 → createArchiving (POST) 한 번만
  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const draftArchiving = locationState?.draftArchiving;
    if (!draftArchiving) {
      alert("러닝 기록 정보가 없습니다. 홈으로 이동합니다.");
      navigate("/home", { replace: true });
      return;
    }

    try {
      setIsUploading(true);

      // 1) 파일 정보 준비
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const contentType = file.type || "image/jpeg";
      const fileName = `archiving_thumb_${Date.now()}.${ext}`;

      console.log("[ArchivingPicture] 썸네일용 파일 정보:", {
        fileName,
        contentType,
      });

      // 2) 썸네일 업로드용 Presigned URL 발급
      const { presignedUrl, imageUrl } = await getPresignedUrl(
        fileName,
        contentType
      );
      console.log("[ArchivingPicture] 썸네일 imageUrl:", imageUrl);
      console.log("[ArchivingPicture] presignedUrl (PUT 대상):", presignedUrl);

      // 3) S3에 실제 사진 업로드
      await axios.put(presignedUrl, file, {
        headers: { "Content-Type": contentType },
      });
      console.log("[ArchivingPicture] S3 업로드 완료");

      // 4) 최종 아카이빙 Body 구성 (thumbnail = 방금 찍은 사진)
      const finalBody = {
        ...draftArchiving,
        thumbnail: imageUrl || draftArchiving.detailImage || "",
      };

      console.log(
        "%c[ArchivingPicture] 최종 createArchiving body:",
        "color:#4caf50",
        finalBody
      );

      // 5) 아카이빙 생성 (POST /archivings)
      const responseData = await createArchiving(finalBody);
      console.log(
        "%c[ArchivingPicture] /archivings POST 응답:",
        "color:#4caf50",
        responseData
      );

      if (!responseData.success || !responseData.data?.archiving_id) {
        throw new Error(responseData.message || "아카이빙 생성 실패");
      }

      const newArchivingId = responseData.data.archiving_id;

      // 6) 상세 페이지로 이동
      navigate(`/archiving/${newArchivingId}`, {
        replace: true,
        state: {
          fromRunning: locationState?.fromRunning,
        },
      });
    } catch (error) {
      console.error(
        "[ArchivingPicture] 아카이빙 생성/썸네일 업로드 실패:",
        error
      );
      console.log("[ArchivingPicture] 서버 응답:", error.response?.data);
      alert("사진을 저장하는 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsUploading(false);
    }
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
