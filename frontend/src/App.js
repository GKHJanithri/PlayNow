import React, { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import './styles.css';
import brandLogo from './assets/Logo.jpeg';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import EventsListPage from './pages/StudentDashboard/EventsListPage';
import EventDetailsPage from './pages/EventDetailsPage';
import AdminCreateEventPage from './pages/AdminCreateEventPage/AdminCreateEventPage';
import AdminDashboardPage from './pages/AdminDashboard/AdminDashboardPage';
import AdminManageFixturesPage from './pages/AdminManageFixturesPage';
import AdminUpdateResultsPage from './pages/AdminUpdateResultsPage';
import AdminMatchScoringPage from './pages/AdminMatchScoringPage';
import AdminFacilityPage from './pages/AdminFacilityPage';
import AdminAddFacilityPage from './pages/AdminAddFacilityPage';
import AdminEditFacilityPage from './pages/AdminEditFacilityPage';
import AdminItemsPage from './pages/AdminItemsPage';
import AdminTeamsPage from './pages/AdminTeamsPage';
import CoachPracticePage from './pages/CoachPracticePage';
import StudentDashboardPage from './pages/StudentDashboard/StudentDashboardPage';
import StudentItemsPage from './pages/StudentDashboard/StudentItemsPage';
import StudentTeamsPage from './pages/StudentDashboard/StudentTeamsPage';
import LoginPage from './pages/Login/LoginPage';
import SignupPage from './pages/signup/SignupPage';
import Home from './pages/Home/Home';
import AboutUs from './pages/AboutUs/AboutUs';
import FacilitiesPage from './pages/Facility/FacilitiesPage';
import FacilityDateTimePage from './pages/Facility/FacilityDateTimePage';
import FacilityConfirmBookingPage from './pages/Facility/FacilityConfirmBookingPage';
import CoachDashboardPage from './pages/teams/CoachDashboardPage';

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
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events/create"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminCreateEventPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/facilities"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminFacilityPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/facilities/new"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminAddFacilityPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/facilities/:facilityId/edit"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminEditFacilityPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/items"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminItemsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/teams"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminTeamsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events/:id/manage"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminManageFixturesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/:id/results"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Coach']}>
                <AdminUpdateResultsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/matches/:matchId/score"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminMatchScoringPage />
              </ProtectedRoute>
            }
          />

          {/* Coach Routes */}
          <Route
            path="/coach/dashboard"
            element={
              <ProtectedRoute allowedRoles={['Coach', 'Admin']}>
                <CoachDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/:id/practice"
            element={
              <ProtectedRoute allowedRoles={['Coach']}>
                <CoachPracticePage />
              </ProtectedRoute>
            }
          />

          {/* Facility & Shared Routes */}
          <Route
            path="/facilities"
            element={
              <ProtectedRoute>
                <FacilitiesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/facilities/:facilityId/book"
            element={
              <ProtectedRoute>
                <FacilityDateTimePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/facilities/:facilityId/confirm"
            element={
              <ProtectedRoute>
                <FacilityConfirmBookingPage />
              </ProtectedRoute>
            }
          />

          {/* Student Routes */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={['Student']}>
                <StudentDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/items"
            element={
              <ProtectedRoute allowedRoles={['Student']}>
                <StudentItemsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/facilities"
            element={<Navigate to="/facilities" replace />}
          />
          <Route
            path="/student/teams"
            element={
              <ProtectedRoute allowedRoles={['Student']}>
                <StudentTeamsPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/events" replace />} />
        </Routes>
      </main>
    </div>
  );
};

const App = () => (
  <BrowserRouter>
    <AppLayout />
  </BrowserRouter>
);

export default App;