
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Existing student pages
import Welcome from "./pages/Welcome";
import Calendar from "./pages/Calendar";
import DailyWords from "./pages/DailyWords";
import Challenge from "./pages/Challenge";
import Results from "./pages/Results";

// Admin pages
import AdminLogin from "./admin/pages/AdminLogin";
import AdminDashboard from "./admin/pages/AdminDashboard";
import ManageWords from "./admin/pages/ManageWords";
import DailySchedule from "./admin/pages/DailySchedule";
import ManageQuiz from "./admin/pages/ManageQuiz";


// Admin components
import ProtectedRoute from "./admin/components/ProtectedRoute";
import AdminLayout from "./admin/components/AdminLayout";
import AdminSectionPlaceholder from "./admin/components/AdminSectionPlaceholder";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public student routes */}
        <Route path="/" element={<Welcome />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/words/:date" element={<DailyWords />} />
        <Route path="/challenge/:date" element={<Challenge />} />
        <Route path="/results/:date" element={<Results />} />

        {/* Public admin login */}
        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        {/* Protected admin area */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route
              path="/admin"
              element={<AdminDashboard />}
            />

            <Route
               path="/admin/words"
                 element={<ManageWords />}
              />  

            <Route
              path="/admin/schedule"
              element={
                <DailySchedule />
              }
            />

            <Route
              path="/admin/quizzes"
              element={
                <ManageQuiz />
              }
            />

            <Route
              path="/admin/settings"
              element={
                <AdminSectionPlaceholder
                  title="Admin Settings"
                  phase="Phase 5F"
                />
              }
            />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
