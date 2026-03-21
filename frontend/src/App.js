import React from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import './styles.css';
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
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/signup/SignupPage';

const AppLayout = () => {
  const location = useLocation();
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div className={`app-shell${isAuthRoute ? ' auth-shell' : ''}`}>
      {!isAuthRoute && <Navbar />}
      <main className={isAuthRoute ? 'main-auth' : ''}>
        <Routes>
          <Route path="/" element={<Navigate to="/events" replace />} />
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
