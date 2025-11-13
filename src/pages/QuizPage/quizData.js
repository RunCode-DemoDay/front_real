// src/pages/QuizPage/quizData.js

export const QUIZ_FLOW = [
  {
    id: 'q1_purpose',
    title: '달리기의 가장 큰 목적은<br />무엇인가요?',
    answers: [
      { text: '🕖 기록을 단축하고 싶어요', key: 'RECORD_CHALLENGE' },
      { text: '💪 건강·체력을 관리하고 싶어요', key: 'HEALTH_FITNESS' },
      { text: '⚡️ 스트레스를 풀고 싶어요', key: 'STRESS_RELEASE' },
      { text: '🎶 재미있게 즐기고 싶어요', key: 'PURE_ENJOYMENT' },
    ],
  },
  
  {
    id: 'q2_style',
    title: '어떤 스타일로<br />달리나요?',
    answers: [
      { text: '✏️ 계획을 세우고 루틴대로', key: 'PLANNED_ROUTINE' },
      { text: '🏆 목표를 향해 점점 강도를 올리며', key: 'INTENSE_GOAL' },
      { text: '😄️ 즉흥적으로, 기분 따라', key: 'SPONTANEOUS_FREE' },
      { text: '🎧 음악이나 풍경에 몰입하며', key: 'IMMERSION_HEALING' },
    ],
  },
  
  {
    id: 'q3_time',
    title: '언제 달리는 것을<br />좋아하나요?',
    answers: [
      { text: '️⛅️ 이른 아침, 하루를 상쾌하게 시작할 때', key: 'EARLY_MORNING' },
      { text: '🔅️ 낮 시간, 햇살을 즐기며', key: 'MID_DAY' },
      { text: '️🌟 저녁, 하루를 정리하면서', key: 'EVENING_WINDDOWN' },
      { text: '🌙 밤 늦게, 혼자 집중할 때', key: 'LATE_NIGHT' },
    ],
  },
  
  {
    id: 'q4_companion',
    title: '누구와 함께 달리는 걸<br />좋아하나요?',
    answers: [
      { text: '☝️ 혼자서 집중하며 달리기', key: 'SOLITARY_FOCUS' },
      { text: '😎️ 친구 한두 명과 함께', key: 'SMALL_SOCIAL' },
      { text: '🏃 러닝 크루·동호회와 함께', key: 'GROUP_CREW' },
      { text: '🧐 상황 따라 달라요', key: 'FLEXIBLE_COMPANION' },
    ],
  },

];