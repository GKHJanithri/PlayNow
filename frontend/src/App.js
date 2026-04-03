import React, { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import './styles.css';
import brandLogo from './assets/Logo.jpeg';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Shared/Public Pages
import Home from './pages/Home/Home';
import AboutUs from './pages/AboutUs/AboutUs';
import LoginPage from './pages/Login/LoginPage';
import SignupPage from './pages/signup/SignupPage';
import EventsListPage from './pages/StudentDashboard/EventsListPage';
import EventDetailsPage from './pages/EventDetailsPage';
import FacilitiesPage from './pages/Facility/FacilitiesPage';
import FacilityDateTimePage from './pages/Facility/FacilityDateTimePage';
import FacilityConfirmBookingPage from './pages/Facility/FacilityConfirmBookingPage';

// Admin Pages
import AdminDashboardPage from './pages/AdminDashboard/AdminDashboardPage';
import AdminCreateEventPage from './pages/AdminCreateEventPage/AdminCreateEventPage';
import AdminManageFixturesPage from './pages/AdminManageFixturesPage';
import AdminUpdateResultsPage from './pages/AdminUpdateResultsPage';
import AdminMatchScoringPage from './pages/AdminMatchScoringPage';
import AdminFacilityPage from './pages/AdminFacilityPage';
import AdminAddFacilityPage from './pages/AdminAddFacilityPage';
import AdminEditFacilityPage from './pages/AdminEditFacilityPage';
import AdminItemsPage from './pages/AdminItemsPage';
import AdminTeamsPage from './pages/AdminTeamsPage';
import AdminItemManagementPage from "./pages/AdminItemManagement";
import AdminItemsReservationsPage from "./pages/AdminItemsReservationsPage";

// Coach Pages
import CoachPracticePage from './pages/CoachPracticePage';

// Student Pages
import StudentDashboardPage from './pages/StudentDashboard/StudentDashboardPage';
import StudentItemsPage from './pages/StudentDashboard/StudentItemsPage';
import StudentItemReservationPage from "./pages/StudentDashboard/StudentItemReservationPage";
import StudentFacilitiesPage from "./pages/StudentDashboard/StudentFacilitiesPage";
import StudentTeamsPage from './pages/StudentDashboard/StudentTeamsPage';

const AppLayout = () => {
  const location = useLocation();
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/signup';
  const isHomeRoute = location.pathname === '/';
  const isFacilityRoute = location.pathname.startsWith('/facilities');
  const isStudentDashboardRoute = location.pathname.startsWith('/student/dashboard');

  useEffect(() => {
    const faviconLink = document.querySelector("link[rel='icon']");
    if (!faviconLink) return;

    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const size = 64;
      canvas.width = size;
      canvas.height = size;

      const context = canvas.getContext('2d');
      if (!context) {
        faviconLink.href = brandLogo;
        return;
      }

      context.drawImage(image, 0, 0, size, size);
      const imageData = context.getImageData(0, 0, size, size);
      const { data } = imageData;

      for (let index = 0; index < data.length; index += 4) {
        const red = data[index];
        const green = data[index + 1];
        const blue = data[index + 2];

        if (red > 238 && green > 238 && blue > 238) {
          data[index + 3] = 0;
        }
      }

      context.putImageData(imageData, 0, 0);
      faviconLink.href = canvas.toDataURL('image/png');
    };

    image.onerror = () => {
      faviconLink.href = brandLogo;
    };

    image.src = brandLogo;
  }, []);

  return (
    <div className={`app-shell${isAuthRoute ? ' auth-shell' : ''}`}>
      {!isAuthRoute && !isHomeRoute && !isFacilityRoute && !isStudentDashboardRoute && <Navbar />}
      <main className={isAuthRoute ? 'main-auth' : isHomeRoute ? 'main-home' : ''}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/events" element={<EventsListPage />} />
          <Route path="/events/:id" element={<EventDetailsPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['Admin']}><AdminDashboardPage /></ProtectedRoute>} />
          <Route path="/admin/events/create" element={<ProtectedRoute allowedRoles={['Admin']}><AdminCreateEventPage /></ProtectedRoute>} />
          <Route path="/admin/facilities" element={<ProtectedRoute allowedRoles={['Admin']}><AdminFacilityPage /></ProtectedRoute>} />
          <Route path="/admin/facilities/new" element={<ProtectedRoute allowedRoles={['Admin']}><AdminAddFacilityPage /></ProtectedRoute>} />
          <Route path="/admin/facilities/:facilityId/edit" element={<ProtectedRoute allowedRoles={['Admin']}><AdminEditFacilityPage /></ProtectedRoute>} />
          <Route path="/admin/items" element={<ProtectedRoute allowedRoles={['Admin']}><AdminItemsPage /></ProtectedRoute>} />
          <Route path="/admin/teams" element={<ProtectedRoute allowedRoles={['Admin']}><AdminTeamsPage /></ProtectedRoute>} />
          <Route path="/admin/events/:id/manage" element={<ProtectedRoute allowedRoles={['Admin']}><AdminManageFixturesPage /></ProtectedRoute>} />
          <Route path="/admin/matches/:matchId/score" element={<ProtectedRoute allowedRoles={['Admin']}><AdminMatchScoringPage /></ProtectedRoute>} />
          <Route path="/admin/item-management" element={<ProtectedRoute allowedRoles={['Admin']}><AdminItemManagementPage /></ProtectedRoute>} />
          <Route path="/admin/item-reservations" element={<ProtectedRoute allowedRoles={['Admin']}><AdminItemsReservationsPage /></ProtectedRoute>} />
          <Route path="/events/:id/results" element={<ProtectedRoute allowedRoles={['Admin', 'Coach']}><AdminUpdateResultsPage /></ProtectedRoute>} />

          {/* Coach Routes */}
          <Route path="/events/:id/practice" element={<ProtectedRoute allowedRoles={['Coach']}><CoachPracticePage /></ProtectedRoute>} />

          {/* Facility Routes */}
          <Route path="/facilities" element={<ProtectedRoute allowedRoles={['Student', 'User']}><FacilitiesPage /></ProtectedRoute>} />
          <Route path="/facilities/:facilityId/book" element={<ProtectedRoute allowedRoles={['Student', 'User']}><FacilityDateTimePage /></ProtectedRoute>} />
          <Route path="/facilities/:facilityId/confirm" element={<ProtectedRoute allowedRoles={['Student', 'User']}><FacilityConfirmBookingPage /></ProtectedRoute>} />
          {/* Student Routes */}
          <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['Student', 'User']}><StudentDashboardPage /></ProtectedRoute>} />
          <Route path="/student/items" element={<ProtectedRoute allowedRoles={['Student', 'User']}><StudentItemsPage /></ProtectedRoute>} />
          <Route path="/student/items/reserve" element={<ProtectedRoute allowedRoles={['Student', 'User']}><StudentItemReservationPage /></ProtectedRoute>} />
          <Route path="/student/facilities" element={<ProtectedRoute allowedRoles={['Student', 'User']}><StudentFacilitiesPage /></ProtectedRoute>} />
          <Route path="/student/teams" element={<ProtectedRoute allowedRoles={['Student', 'User']}><StudentTeamsPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/events" replace />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;