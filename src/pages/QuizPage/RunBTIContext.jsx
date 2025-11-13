
import React, { createContext, useReducer, useContext } from 'react';

// 1. 초기 상태 정의: 4가지 질문의 답변을 저장할 구조
const initialRunBTIState = {
  q1_purpose: null,
  q2_style: null,
  q3_time: null,
  q4_companion: null,
  resultType: null,
};

// 2. Reducer 정의: 상태 업데이트 로직
const runBTI_Reducer = (state, action) => {
  switch (action.type) {
    case 'SET_ANSWER':
      return { ...state, [action.payload.key]: action.payload.value };
    case 'SET_RESULT':
      return { ...state, resultType: action.payload };
    case 'RESET_QUIZ':
      return initialRunBTIState;
    default:
      return state;
  }
};

// 3. Context 생성
const RunBTIContext = createContext();

// 4. Provider 컴포넌트
export const RunBTIProvider = ({ children }) => {
  const [state, dispatch] = useReducer(runBTI_Reducer, initialRunBTIState);

  return (
    <RunBTIContext.Provider value={{ state, dispatch }}>
      {children}
    </RunBTIContext.Provider>
  );
};

// 5. Custom Hook: 컴포넌트에서 Context를 쉽게 사용하도록 함
export const useRunBTI = () => useContext(RunBTIContext);