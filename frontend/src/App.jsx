import React from "react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Analytics from "./pages/Analytics";
import Dashboard from "./pages/Dashboard";
import Demo from "./pages/Demo";
import Emails from "./pages/Emails";
import Landing from "./pages/Landing";
import LeadDetails from "./pages/LeadDetails";
import Leads from "./pages/Leads";
import Login from "./pages/Login";
import AuditLogs from "./pages/AuditLogs";
import PrivacyCenter from "./pages/PrivacyCenter";
import PitchStory from "./pages/PitchStory";
import Register from "./pages/Register";
import Settings from "./pages/Settings";
import SystemStatus from "./pages/SystemStatus";
import Templates from "./pages/Templates";

const LegacyLeadRedirect = () => {
  const { leadId } = useParams();
  return <Navigate to={`/app/leads/${leadId}`} replace />;
};

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/demo" element={<Demo />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="leads" element={<Leads />} />
        <Route path="leads/:leadId" element={<LeadDetails />} />
        <Route path="emails" element={<Emails />} />
        <Route path="templates" element={<Templates />} />
        <Route path="settings" element={<Settings />} />
        <Route path="privacy" element={<PrivacyCenter />} />
        <Route path="audit-logs" element={<AuditLogs />} />
        <Route path="pitch-story" element={<PitchStory />} />
        <Route path="status" element={<SystemStatus />} />
      </Route>

      <Route path="/settings" element={<Navigate to="/app/settings" replace />} />
      <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
      <Route path="/analytics" element={<Navigate to="/app/analytics" replace />} />
      <Route path="/leads" element={<Navigate to="/app/leads" replace />} />
      <Route path="/leads/:leadId" element={<LegacyLeadRedirect />} />
      <Route path="/emails" element={<Navigate to="/app/emails" replace />} />
      <Route path="/templates" element={<Navigate to="/app/templates" replace />} />
      <Route path="/privacy" element={<Navigate to="/app/privacy" replace />} />
      <Route path="/audit-logs" element={<Navigate to="/app/audit-logs" replace />} />
      <Route path="/pitch-story" element={<Navigate to="/app/pitch-story" replace />} />
      <Route path="/status" element={<Navigate to="/app/status" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
