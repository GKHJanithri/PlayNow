import React, { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import './styles.css';
import brandLogo from './assets/Logo.jpeg';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import EventsListPage from './pages/EventsListPage';
import EventDetailsPage from './pages/EventDetailsPage';
import AdminCreateEventPage from './pages/AdminCreateEventPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminManageFixturesPage from './pages/AdminManageFixturesPage';
import AdminUpdateResultsPage from './pages/AdminUpdateResultsPage';
import AdminMatchScoringPage from './pages/AdminMatchScoringPage';
import CoachPracticePage from './pages/CoachPracticePage';
import LoginPage from './pages/Login/LoginPage';
import SignupPage from './pages/signup/SignupPage';
import Home from './pages/Home/Home';
import AboutUs from './pages/AboutUs/AboutUs';

const AppLayout = () => {
  const location = useLocation();
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/signup';
  const isHomeRoute = location.pathname === '/';

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
      {!isAuthRoute && !isHomeRoute && <Navbar />}
      <main className={isAuthRoute ? 'main-auth' : isHomeRoute ? 'main-home' : ''}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/events" element={<EventsListPage />} />
          <Route path="/events/:id" element={<EventDetailsPage />} />
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
          <Route
            path="/events/:id/practice"
            element={
              <ProtectedRoute allowedRoles={['Coach']}>
                <CoachPracticePage />
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
