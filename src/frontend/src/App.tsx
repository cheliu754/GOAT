import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import TopBar from "./components/TopBar";
import Footer from "./components/Footer";
import DashBoard from "./pages/DashBoard";
import UpdateModal from './pages/UpdateModal';
import Colleges from './pages/Colleges';
import SignIn from "./pages/SignIn";
import { Toaster } from "./components/ui/sonner";

function AppInner() {
  const location = useLocation();
  const state = location.state as { backgroundLocation?: Location } | null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopBar />
      <main className="flex-1 overflow-y-auto">
        {/* Base routes render against the "backgroundLocation" if present */}
        <Routes location={state?.backgroundLocation || location}>
          <Route path="/" element={
            <ProtectedRoute showEmptyState={true}>
              <DashBoard />
            </ProtectedRoute>
          } />
          <Route path="/colleges" element={<Colleges />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/update" element={
            <ProtectedRoute>
              <UpdateModal />
            </ProtectedRoute>
          } />
        </Routes>

        {/* When a background location is set, render the modal on top */}
        {state?.backgroundLocation && (
          <Routes>
            <Route path="/update" element={
              <ProtectedRoute>
                <UpdateModal />
              </ProtectedRoute>
            } />
          </Routes>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppInner />
        <Toaster position="top-center" richColors />
      </AuthProvider>
    </Router>
  );
}