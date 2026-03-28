import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import AboutUs from "./pages/AboutUs/AboutUs";
import LoginPage from "./pages/Login/LoginPage";
import SignupPage from "./pages/signup/SignupPage";
import EventsListPage from "./pages/EventsListPage";
import EventDetailsPage from "./pages/EventDetailsPage";
import StudentDashboardPage from "./pages/StudentDashboard/StudentDashboardPage";
import StudentItemsPage from "./pages/StudentDashboard/StudentItemsPage";
import StudentItemReservationPage from "./pages/StudentDashboard/StudentItemReservationPage";
import StudentFacilitiesPage from "./pages/StudentDashboard/StudentFacilitiesPage";
import StudentTeamsPage from "./pages/StudentDashboard/StudentTeamsPage";
import AdminDashboardPage from "./pages/AdminDashboard/AdminDashboardPage";
import AdminCreateEventPage from "./pages/AdminCreateEventPage";
import AdminFacilityPage from "./pages/AdminFacilityPage";
import AdminItemsPage from "./pages/AdminItemsPage";
import AdminTeamsPage from "./pages/AdminTeamsPage";
import AdminManageFixturesPage from "./pages/AdminManageFixturesPage";
import AdminUpdateResultsPage from "./pages/AdminUpdateResultsPage";
import AdminMatchScoringPage from "./pages/AdminMatchScoringPage";
import CoachPracticePage from "./pages/CoachPracticePage";
import FacilitiesPage from "./pages/Facility/FacilitiesPage";
import FacilityDateTimePage from "./pages/Facility/FacilityDateTimePage";
import FacilityConfirmBookingPage from "./pages/Facility/FacilityConfirmBookingPage";

function App() {
  return (
    <BrowserRouter>
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/events" element={<EventsListPage />} />
        <Route path="/events/:eventId" element={<EventDetailsPage />} />
        <Route path="/events/:eventId/results" element={<AdminUpdateResultsPage />} />

        <Route path="/student/dashboard" element={<StudentDashboardPage />} />
        <Route path="/student/items" element={<StudentItemsPage />} />
        <Route path="/student/items/reserve" element={<StudentItemReservationPage />} />
        <Route path="/student/facilities" element={<StudentFacilitiesPage />} />
        <Route path="/student/teams" element={<StudentTeamsPage />} />

        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/events/create" element={<AdminCreateEventPage />} />
        <Route path="/admin/facilities" element={<AdminFacilityPage />} />
        <Route path="/admin/items" element={<AdminItemsPage />} />
        <Route path="/admin/teams" element={<AdminTeamsPage />} />
        <Route path="/admin/fixtures" element={<AdminManageFixturesPage />} />
        <Route path="/admin/match-scoring" element={<AdminMatchScoringPage />} />

        <Route path="/coach/practice" element={<CoachPracticePage />} />

        <Route path="/facilities" element={<FacilitiesPage />} />
        <Route path="/facilities/:facilityId/book" element={<FacilityDateTimePage />} />
        <Route path="/facilities/:facilityId/confirm" element={<FacilityConfirmBookingPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
