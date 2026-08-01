import { BrowserRouter, Routes, Route } from "react-router-dom";
import LiveMeter from "./pages/LiveMeter";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import Bills from "./pages/Bills";
import BillsUploadPage from "./pages/BillsUploadPage";
import DailyUsagePage from "./pages/DailyUsagePage";
import BillHistoryPage from "./pages/BillHistoryPage";
import AIInsightsPage from "./pages/AIInsightsPage";
import AnalysisPage from "./pages/AnalysisPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import AlertsPage from "./pages/AlertsPage";
import AppliancesPage from "./pages/AppliancesPage";
import WeatherPage from "./pages/WeatherPage";
import CarbonPage from "./pages/CarbonPage";
import UsageTrendsPage from "./pages/UsageTrendsPage";
import BudgetPage from "./pages/BudgetPage";
import SimulatorPage from "./pages/SimulatorPage";
import UploadBill from "./pages/UploadBill";
import Profile from "./pages/Profile";
import ProfileHomeDetailsPage from "./pages/ProfileHomeDetailsPage";
import ProfileAchievementsPage from "./pages/ProfileAchievementsPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

import { AuthProvider } from "./context/AuthContext";
import { BillProvider } from "./context/BillContext";
import { ToastProvider } from "./context/ToastContext";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BillProvider>
          <ToastProvider>

            <Routes>

              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>

                  <Route path="/" element={<Dashboard />} />

                  <Route path="/bills" element={<Bills />} />
                  <Route path="/bills/upload" element={<BillsUploadPage />} />
                  <Route path="/bills/daily-usage" element={<DailyUsagePage />} />
                  <Route path="/bills/history" element={<BillHistoryPage />} />

                  <Route path="/upload" element={<UploadBill />} />

                  <Route path="/budget" element={<BudgetPage />} />

                  <Route path="/ai-insights" element={<AIInsightsPage />} />
                  <Route path="/ai-insights/analysis" element={<AnalysisPage />} />
                  <Route path="/ai-insights/recommendations" element={<RecommendationsPage />} />
                  <Route path="/ai-insights/alerts" element={<AlertsPage />} />
                  <Route path="/ai-insights/appliances" element={<AppliancesPage />} />
                  <Route path="/ai-insights/weather" element={<WeatherPage />} />
                  <Route path="/ai-insights/carbon" element={<CarbonPage />} />
                  <Route path="/ai-insights/usage-trends" element={<UsageTrendsPage />} />

                  <Route path="/simulator" element={<SimulatorPage />} />

                  <Route path="/profile" element={<Profile />} />
                  <Route path="/profile/home-details" element={<ProfileHomeDetailsPage />} />
                  <Route path="/profile/achievements" element={<ProfileAchievementsPage />} />

                  <Route path="/live-meter" element={<LiveMeter />} />

                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />

            </Routes>

          </ToastProvider>
        </BillProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;