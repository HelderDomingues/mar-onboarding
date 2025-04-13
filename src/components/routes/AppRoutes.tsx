
import React from "react";
import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/routes/ProtectedRoute";
import AdminRoute from "@/components/routes/AdminRoute";

import Dashboard from "@/pages/Dashboard";
import Quiz from "@/pages/Quiz";
import QuizReview from "@/pages/QuizReview";
import QuizDiagnostic from "@/pages/QuizDiagnostic";
import QuizViewAnswers from "@/pages/QuizViewAnswers";
import Materials from "@/pages/Materials";
import MemberArea from "@/pages/MemberArea";
import FAQ from "@/pages/FAQ";
import NotFound from "@/pages/NotFound";
import IndexPage from "@/pages/Index";
import TestConnectionPage from "@/pages/TestConnection";
import SystemLog from "@/pages/SystemLog";
import DiagnosticoSistema from "@/pages/DiagnosticoSistema";

// Admin pages
import ImportUsers from "@/pages/admin/ImportUsers";
import NewUser from "@/pages/admin/NewUser";
import Settings from "@/pages/admin/Settings";
import Users from "@/pages/admin/Users";
import QuizResponses from "@/pages/admin/QuizResponses";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<IndexPage />} />

      <Route path="/dashboard" element={<ProtectedRoute component={Dashboard} />} />
      <Route path="/quiz" element={<ProtectedRoute component={Quiz} />} />
      <Route path="/quiz/review" element={<ProtectedRoute component={QuizReview} />} />
      <Route path="/quiz/view-answers" element={<ProtectedRoute component={QuizViewAnswers} />} />
      <Route path="/quiz/diagnostic" element={<ProtectedRoute component={QuizDiagnostic} />} />
      <Route path="/materials" element={<ProtectedRoute component={Materials} />} />
      <Route path="/member" element={<ProtectedRoute component={MemberArea} />} />
      <Route path="/faq" element={<ProtectedRoute component={FAQ} />} />
      <Route path="/diagnostico" element={<ProtectedRoute component={DiagnosticoSistema} />} />

      {/* Admin routes */}
      <Route path="/admin" element={<AdminRoute />}>
        <Route path="users" element={<Users />} />
        <Route path="users/new" element={<NewUser />} />
        <Route path="users/import" element={<ImportUsers />} />
        <Route path="quiz-responses" element={<QuizResponses />} />
        <Route path="settings" element={<Settings />} />
        <Route path="logs" element={<SystemLog />} />
      </Route>

      <Route path="/test-connection" element={<ProtectedRoute component={TestConnectionPage} />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
