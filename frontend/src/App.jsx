import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import Bills from "./pages/Bills";
import AIInsightsPage from "./pages/AIInsightsPage";
import UploadBill from "./pages/UploadBill";
import Profile from "./pages/Profile";
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

              {/* Public Routes */}

              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected Routes */}

              <Route element={<ProtectedRoute />}>

                <Route element={<Layout />}>

                  <Route path="/" element={<Dashboard />} />

                  <Route
                    path="/bills"
                    element={<Bills />}
                  />

                  <Route
                    path="/upload"
                    element={<UploadBill />}
                  />

                  <Route
                    path="/ai-insights"
                    element={<AIInsightsPage />}
                  />

                  <Route
                    path="/profile"
                    element={<Profile />}
                  />

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