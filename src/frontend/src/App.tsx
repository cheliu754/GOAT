import './App.css';

import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import TopBar from "./components/TopBar";
import DashBoard from "./pages/DashBoard";
import UpdateModal from './pages/UpdateModal';
import Colleges from './pages/Colleges';
import SignIn from "./pages/SignIn";
import { AuthProvider } from './auth/AuthProvider';

function AppInner() {
  const location = useLocation();
  const state = location.state as { backgroundLocation?: Location } | null;

  return (
    <>
      <TopBar />
      {/* Base routes render against the "backgroundLocation" if present */}
      <Routes location={state?.backgroundLocation || location}>
        <Route path="/" element={<DashBoard />} />
        <Route path="/colleges" element={<Colleges />} />
        <Route path="/signin" element={<SignIn />} />  
      </Routes>

      {/* When a background location is set, render the modal on top */}
      {state?.backgroundLocation && (
        <Routes>
          <Route path="/update" element={<UpdateModal />} />
        </Routes>
      )}

      {/* Also support direct visit to /update (no background) */}
      {!state?.backgroundLocation && (
        <Routes>
          <Route path="/update" element={<UpdateModal />} />
        </Routes>
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router basename="/CollegeApplicationTracker">
        <AppInner />
      </Router>
    </AuthProvider>
  );
}
