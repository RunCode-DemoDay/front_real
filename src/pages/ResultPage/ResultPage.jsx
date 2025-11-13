// src/pages/ResultPage/ResultPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FixedBottomButton from "../../component/FixedBottomButton/FixedBottomButton";
import { useRunBTI } from "../QuizPage/RunBTIContext";
import { useAuth } from "../../contexts/AuthContext";
import { patchMyType } from "../../api/userTypeAPI";
import { getTypesWithTags } from "../../api/homeAPI"; // ✅ /types 호출해서 상세+태그 가져오기
import "./ResultPage.css";

/** 프론트에서 런BTI 코드 계산 (HFNT 등) */
const calculateScores = (answers) => {
  let code = "";

  // Q1: 목적 (G vs H)
  if (answers.q1_purpose === "RECORD_CHALLENGE") code += "G";
  else code += "H";

  // Q2: 스타일 (P vs F)
  if (
    answers.q2_style === "PLANNED_ROUTINE" ||
    answers.q2_style === "INTENSE_GOAL"
  )
    code += "P";
  else code += "F";

  // Q3: 시간대 (S vs N)
  if (answers.q3_time === "EARLY_MORNING" || answers.q3_time === "MID_DAY")
    code += "S";
  else code += "N";

  // Q4: 동행 (M vs T)
  if (answers.q4_companion === "SOLITARY_FOCUS") code += "M";
  else code += "T";

  return { runBtiCode: code };
};

const ResultPage = () => {
  const { state } = useRunBTI();
  const { userProfile, loginSuccess } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [runType, setRunType] = useState(null); // { name, description, thumbnail?, tags? }
  const [error, setError] = useState("");

  // 액세스 토큰이 로컬/컨텍스트 어디에 있든 우선순위로 가져오기
  const tokenFromStorage =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken") ||
        localStorage.getItem("access_token")
      : null;

  const token =
    tokenFromStorage || userProfile?.accessToken || userProfile?.token || null;

  useEffect(() => {
    const answers = [
      state?.q1_purpose,
      state?.q2_style,
      state?.q3_time,
      state?.q4_companion,
    ];
    const allAnswered = answers.every((v) => v != null);

    if (!allAnswered) {
      setError("결과를 불러오지 못했습니다.");
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        // 1) 코드 계산
        const { runBtiCode } = calculateScores(state);
        console.log("계산된 RunBTI 코드:", runBtiCode);

        // 2) 내 타입 저장: PATCH /api/users/me { typeCode }
        const patchRes = await patchMyType({ typeCode: runBtiCode, token });

        // 백 응답 예: { success, code, message, data: { ...user } }
        const rawUser = patchRes?.data ?? patchRes?.user ?? patchRes ?? {};
        const typeField = rawUser.type;

        const typeNameFromUser =
          typeof typeField === "string"
            ? typeField
            : typeField?.name || runBtiCode;

        // 3) /types 호출해서 내가 받은 런비티아이 상세/설명 가져오기
        //    (명세서: data = { type_id, name, description, thumbnail, tags: [...] })
        let finalTypeName = typeNameFromUser;
        let typeDescription = "";
        let typeThumbnail = null;
        let typeTags = [];

        try {
          const typesRes = await getTypesWithTags();
          // homeAPI.getTypesWithTags()는 보통 { success, code, message, data } 반환
          if (typesRes && typesRes.success && typesRes.data) {
            const t = typesRes.data;
            finalTypeName = t.name || finalTypeName;
            typeDescription = t.description || "";
            typeThumbnail = t.thumbnail || null;
            typeTags = Array.isArray(t.tags) ? t.tags : [];
          } else {
            console.warn("/types 응답 이상:", typesRes);
          }
        } catch (err) {
          console.error("/types 호출 에러 (ResultPage):", err);
          // /types 실패해도 이름만이라도 보여줄 수 있게 그냥 진행
        }

        // 4) 결과 페이지에서 보여줄 유형 정보 세팅
        setRunType({
          name: finalTypeName,
          description: typeDescription,
          thumbnail: typeThumbnail,
          tags: typeTags,
        });

        // 5) AuthContext 갱신 (헤더, 홈 화면에서 type 활용)
        if (userProfile) {
          loginSuccess({
            ...userProfile,
            ...rawUser, // 서버가 내려준 최신 유저 정보로 덮어쓰기
          });
        } else {
          loginSuccess(rawUser);
        }
      } catch (e) {
        console.error("결과 처리 중 에러:", e.response?.data || e.message);
        setError("결과를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStart = () => navigate("/home");

  if (loading)
    return <div className="result-page loading">결과를 계산 중입니다...</div>;
  if (error) return <div className="result-page error-message">{error}</div>;
  if (!runType)
    return (
      <div className="result-page error-message">결과 데이터가 없습니다.</div>
    );

  return (
    <div className="result-page-container">
      <div className="content-area">
        <span className="my-type-label">나의 러너 유형</span>

        {/* 썸네일이 있으면 여기에 이미지도 넣을 수 있음 */}
        <div className="type-image-placeholder" />

        <h1 className="r-type-name">{runType.name}</h1>

        {/* ✅ 이제 /types에서 내려온 description이 있으면 화면에 표시됨 */}
        {runType.description && (
          <p
            className="type-description"
            dangerouslySetInnerHTML={{
              __html: runType.description,
            }}
          />
        )}
      </div>

      <FixedBottomButton
        label="시작하기"
        onClick={handleStart}
        backgroundColor="#FF003C"
      />
    </div>
  );
};

export default ResultPage;
