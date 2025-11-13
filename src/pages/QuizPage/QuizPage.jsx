// src/pages/QuizPage/QuizPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRunBTI } from './RunBTIContext'; 
import { QUIZ_FLOW } from './quizData'; 

import FixedBottomButton from '../../component/FixedBottomButton/FixedBottomButton'; 
import LeftArrowIcon from '../../assets/Left.svg'; 
import './QuizPage.css'; 

const QuizPage = () => {
    const { questionIndex } = useParams();
    const index = parseInt(questionIndex) - 1; // 배열 인덱스 (0부터 시작)
    
    const { state, dispatch } = useRunBTI();
    const navigate = useNavigate();

    const currentQuiz = QUIZ_FLOW[index];

    // --- 데이터 확인 및 초기 선택지 복원 ---
    const initialSelection = state[currentQuiz.id] || null;
    const [selectedAnswerKey, setSelectedAnswerKey] = useState(initialSelection);
    
    const isLastQuestion = (index === QUIZ_FLOW.length - 1); 

    if (!currentQuiz) {
        return navigate('/'); 
    }
    
    // 뒤로가기 시 이전 답변 복원 (index가 바뀔 때 실행)
    useEffect(() => {
        const questionId = currentQuiz.id;
        
        const savedAnswer = state[questionId] || null; 
        
        setSelectedAnswerKey(savedAnswer);

    }, [index, state, currentQuiz.id]);


    // --- 이벤트 핸들러 ---
    
    const handleOptionSelect = (key) => {
        setSelectedAnswerKey(key);
    };

    const handleNext = () => {
        if (!selectedAnswerKey) {
            alert('답변을 선택해주세요.');
            return;
        }

        // a. 전역 상태에 답변 저장
        dispatch({ 
            type: 'SET_ANSWER', 
            payload: { key: currentQuiz.id, value: selectedAnswerKey } 
        });
        
        // b. 다음 페이지로 이동
        if (isLastQuestion) {
            navigate('/result'); 
        } else {
            navigate(`/quiz/${index + 2}`); 
        }
    };
    
    const handleGoBack = () => {
        // Q1이 아닐 때만 이전 페이지로 이동
        if (index > 0) {
            // Context에 현재 선택된 답변 임시 저장 (뒤로 갔다가 돌아올 경우 대비)
            if (selectedAnswerKey) {
                 dispatch({ 
                    type: 'SET_ANSWER', 
                    payload: { key: currentQuiz.id, value: selectedAnswerKey } 
                });
            }
            navigate(-1); 
        } else {
            navigate('/'); // Q1에서는 시작 페이지로 이동
        }
    };

    // --- JSX 렌더링 ---
    return (
        <div className="quiz-page">
            
            {/* 1. 뒤로가기 버튼만 왼쪽 상단에 배치 */}
            <div className="top-navigation">
                <button onClick={handleGoBack} className="back-button">
                    <img src={LeftArrowIcon} alt="뒤로가기" /> 
                </button>
            </div>

            {/* 2. 점 진행 표시기 (중앙 정렬) */}
            <div className="progress-dots-wrapper">
                <div className="progress-dots">
                    {QUIZ_FLOW.map((_, i) => (
                        <span 
                            key={i} 
                            /* ✨ 로직 수정: i === index 일 때만 active 클래스 부여 (하나씩 채워짐) */
                            className={`dot ${i === index ? 'active' : ''}`}
                        />
                    ))}
                </div>
            </div>

            {/* 퀴즈 제목 영역 */}
            <div className="quiz-header">
                <h2 dangerouslySetInnerHTML={{ __html: currentQuiz.title }} />
            </div>

            {/* 선택지 영역 */}
            <div className="quiz-options">
                {currentQuiz.answers.map((answer, i) => (
                    <button 
                        key={i} 
                        className={`option-button ${selectedAnswerKey === answer.key ? 'selected' : ''}`}
                        onClick={() => handleOptionSelect(answer.key)}
                    >
                        {answer.text} 
                    </button>
                ))}
            </div>

            {/* 하단 고정 버튼 */}
            <FixedBottomButton
                label={isLastQuestion ? "결과보기" : "다음으로"}
                onClick={handleNext}
                backgroundColor="#FF003C" 
                disabled={!selectedAnswerKey} 
            />
        </div>
    );
};

export default QuizPage;