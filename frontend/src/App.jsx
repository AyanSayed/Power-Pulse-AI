import { BrowserRouter, Routes, Route } from "react-router-dom";
import LiveMeter from "./pages/LiveMeter";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import BillsUploadPage from "./pages/BillsUploadPage";
import DailyUsagePage from "./pages/DailyUsagePage";
import BillHistoryPage from "./pages/BillHistoryPage";
import InsightsPage from "./pages/InsightsPage";
import AppliancesPage from "./pages/AppliancesPage";
import CarbonPage from "./pages/CarbonPage";
import UsageTrendsPage from "./pages/UsageTrendsPage";
import BudgetPage from "./pages/BudgetPage";
import SimulatorPage from "./pages/SimulatorPage";
import UploadBill from "./pages/UploadBill";
import Profile from "./pages/Profile";
import ProfileHomeDetailsPage from "./pages/ProfileHomeDetailsPage";
import ProfileAchievementsPage from "./pages/ProfileAchievementsPage";
import ApplianceProfilePage from "./pages/ApplianceProfilePage";
import ApplianceAuditPage from "./pages/ApplianceAuditPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import ACAdvisor from "./pages/ACAdvisor";
import EnergyToolsPage from "./pages/EnergyToolsPage";
import BillHealthPage from "./pages/BillHealthPage";
import { AuthProvider } from "./context/AuthContext";
import { BillProvider } from "./context/BillContext";
import { ToastProvider } from "./context/ToastContext";
import { useBill } from "./context/BillContext";
import { Navigate } from "react-router-dom";

function Tier3Route({ children }) {
  const { dataTier } = useBill();
  return dataTier === 3 ? children : <Navigate to="/" replace />;
}
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

                  <Route path="/bills/upload" element={<BillsUploadPage />} />
                  <Route path="/bills/daily-usage" element={<DailyUsagePage />} />
                  <Route path="/bills/history" element={<BillHistoryPage />} />
                  <Route path="/bills/health-check" element={<BillHealthPage />} />

                  <Route path="/upload" element={<UploadBill />} />

                  <Route path="/budget" element={<BudgetPage />} />

                  <Route path="/ai-insights" element={<InsightsPage />} />
                  <Route path="/ai-insights/appliances" element={<AppliancesPage />} />
                  <Route path="/ai-insights/audit-matrix" element={<ApplianceAuditPage />} />
                  <Route path="/ai-insights/carbon" element={<CarbonPage />} />
                  <Route path="/ai-insights/usage-trends" element={<UsageTrendsPage />} />

                  <Route path="/simulator" element={<SimulatorPage />} />
                  <Route path="/ac-advisor" element={<ACAdvisor />} />
                  <Route path="/energy-tools" element={<EnergyToolsPage />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/profile/home-details" element={<ProfileHomeDetailsPage />} />
                  <Route path="/profile/achievements" element={<ProfileAchievementsPage />} />
                  <Route path="/profile/appliance-profile" element={<ApplianceProfilePage />} />

                  <Route path="/live-meter" element={<Tier3Route><LiveMeter /></Tier3Route>} />

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
