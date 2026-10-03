import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const MyHabits = lazy(() => import("./pages/MyHabits"));
const GuardianRequests = lazy(() => import("./pages/GuardianRequests"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const CreateHabit = lazy(() => import("./pages/CreateHabit"));
const EditHabit = lazy(() => import("./pages/EditHabit"));
const Friends = lazy(() => import("./pages/Friends"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const AICoach = lazy(() => import("./pages/AICoach"));
const Wellness = lazy(() => import("./pages/Wellness"));
const Community = lazy(() => import("./pages/Community"));
const Settings = lazy(() => import("./pages/Settings"));
const Analytics = lazy(() => import("./pages/Analytics"));

function PageLoader() {
  return (
    <div className="min-h-screen bg-[#f9f9f8] flex items-center justify-center text-gray-400 font-black">
      Loading...
    </div>
  );
}

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/habits" element={<PrivateRoute><MyHabits /></PrivateRoute>} />
          <Route path="/guardian" element={<PrivateRoute><GuardianRequests /></PrivateRoute>} />
          <Route path="/create-habit" element={<PrivateRoute><CreateHabit /></PrivateRoute>} />
          <Route path="/edit-habit/:habitId" element={<PrivateRoute><EditHabit /></PrivateRoute>} />
          <Route path="/friends" element={<PrivateRoute><Friends /></PrivateRoute>} />
          <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
          <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
          <Route path="/ai-coach" element={<PrivateRoute><AICoach /></PrivateRoute>} />
          <Route path="/wellness" element={<PrivateRoute><Wellness /></PrivateRoute>} />
          <Route path="/community" element={<PrivateRoute><Community /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />

          <Route path="*" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
