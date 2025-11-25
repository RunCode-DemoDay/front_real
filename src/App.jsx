// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppContainer from "./AppContainer/AppContainer";

// 페이지 import
import StartPage from "./pages/StartPage/StartPage";
import QuizPage from "./pages/QuizPage/QuizPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import AuthHandlerPage from "./pages/AuthHandlerPage/AuthHandlerPage";
import ResultPage from "./pages/ResultPage/ResultPage";
import HomePage from "./pages/HomePage/HomePage";
import SearchPage from "./pages/SearchPage/SearchPage";
import SavedCoursesPage from "./pages/SavedCoursesPage/SavedCoursesPage";
import CourseDetailPage from "./pages/CourseDetailPage/CourseDetailPage";
import CourseAllReviewsPage from "./pages/CourseAllReviewsPage/CourseAllReviewsPage";
import ArchivingMapPage from "./pages/ArchivingMapPage/ArchivingMapPage";
import ArchivingListPage from "./pages/ArchivingListPage/ArchivingListPage";
import ArchivingDetailPage from "./pages/ArchivingDetailPage/ArchivingDetailPage";
import MyPage from "./pages/MyPage/MyPage";
import ReviewAdd from "./pages/ReviewAdd/ReviewAdd";
import ReviewStar from "./pages/ReviewStar/ReviewStar";
import ReviewMy from "./pages/ReviewMy/ReviewMy";
import RunningCount from "./pages/RunningCount/RunningCount";
import RunningActive from "./pages/RunningActive/RunningActive";
import RunningStop from "./pages/RunningStop/RunningStop";
import ArchivingPicture from "./pages/ArchivingPicture/ArchivingPicture";


// Context Provider
import { RunBTIProvider } from "./pages/QuizPage/RunBTIContext";
import { AuthProvider } from "./contexts/AuthContext";
import RealStartPage from "./pages/RealStartPage/RealStartPage";

function App() {
  return (
    <AuthProvider>
      <RunBTIProvider>
        <BrowserRouter>
          <AppContainer>
            <Routes>
              {/* 기본 경로 */}
              <Route path="/" element={<RealStartPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/result" element={<ResultPage />} />

              {/* 카카오 로그인 콜백 → 여기서 토큰 꺼내서 /start로 보내는 걸로 통일 */}
              <Route
                path="/oauth/kakao/callback"
                element={<AuthHandlerPage />}
              />

              {/* 메인 페이지들 */}
              <Route path="/home" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/saved" element={<SavedCoursesPage />} />
              <Route path="/mypage" element={<MyPage />} />

              {/* 리뷰 관련 */}
              <Route path="/reviewadd" element={<ReviewAdd />} />
              <Route path="/reviewmy" element={<ReviewMy />} />
              <Route path="/reviewstar/:courseId" element={<ReviewStar />} />

              {/* 코스 상세 / 리뷰 전체보기 */}
              <Route path="/course/:courseId" element={<CourseDetailPage />} />
              <Route
                path="/course/:courseId/reviews"
                element={<CourseAllReviewsPage />}
              />

              {/* 아카이빙 */}
              <Route path="/archiving/map" element={<ArchivingMapPage />} />
              <Route path="/archiving/list" element={<ArchivingListPage />} />
              <Route
                path="/archiving/:archivingId"
                element={<ArchivingDetailPage />}
              />
              <Route path="/archiving/picture" element={<ArchivingPicture />} />
              {/* 팀원이 추가한 카메라 캡처 페이지도 살림 */}
             

              {/* 러닝 관련 */}
              <Route
                path="/running/count/:courseId"
                element={<RunningCount />}
              />
              <Route
                path="/running/active/:courseId"
                element={<RunningActive />}
              />
              <Route
                path="/running/stop/:courseId"
                element={<RunningStop />}
              />

              {/* 런BTI 온보딩 / 퀴즈 */}
              <Route path="/start" element={<StartPage />} />
              <Route path="/quiz/:questionIndex" element={<QuizPage />} />
            </Routes>
          </AppContainer>
        </BrowserRouter>
      </RunBTIProvider>
    </AuthProvider>
  );
}

export default App;
