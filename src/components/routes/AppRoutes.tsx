
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
import QuizTest from "@/pages/QuizTest";
import Profile from "@/pages/Profile";

// Admin pages
import ImportUsers from "@/pages/admin/ImportUsers";
import NewUser from "@/pages/admin/NewUser";
import Settings from "@/pages/admin/Settings";
import Users from "@/pages/admin/Users";
import QuizResponses from "@/pages/admin/QuizResponses";
import AdminMaterials from "@/pages/admin/AdminMaterials";
import Reports from "@/pages/admin/Reports";
import Metrics from "@/pages/admin/Metrics";
import QuizEditor from "@/pages/admin/QuizEditor";
import SeedQuiz from "@/pages/admin/SeedQuiz";
import RecoverQuiz from "@/pages/admin/RecoverQuiz";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<IndexPage />} />

      <Route path="/dashboard" element={<ProtectedRoute component={Dashboard} />} />
      <Route path="/profile" element={<ProtectedRoute component={Profile} />} />
      <Route path="/quiz" element={<ProtectedRoute component={Quiz} />} />
      <Route path="/quiz/review" element={<ProtectedRoute component={QuizReview} />} />
      <Route path="/quiz/view-answers" element={<ProtectedRoute component={QuizViewAnswers} />} />
      <Route path="/quiz/diagnostic" element={<ProtectedRoute component={QuizDiagnostic} />} />
      <Route path="/materials" element={<ProtectedRoute component={Materials} />} />
      <Route path="/member" element={<ProtectedRoute component={MemberArea} />} />
      <Route path="/faq" element={<ProtectedRoute component={FAQ} />} />
      <Route path="/diagnostico" element={<ProtectedRoute component={DiagnosticoSistema} />} />
      <Route path="/quiz-test" element={<QuizTest />} />
      <Route path="/test-connection" element={<TestConnectionPage />} />

      {/* Admin routes */}
      <Route path="/admin/*" element={<AdminRoute />}>
        <Route path="users" element={<Users />} />
        <Route path="users/new" element={<NewUser />} />
        <Route path="users/import" element={<ImportUsers />} />
        <Route path="quiz-responses" element={<QuizResponses />} />
        <Route path="quiz-editor" element={<QuizEditor />} />
        <Route path="seed-quiz" element={<SeedQuiz />} />
        <Route path="recover-quiz" element={<RecoverQuiz />} />
        <Route path="materials" element={<AdminMaterials />} />
        <Route path="metrics" element={<Metrics />} />
        <Route path="settings" element={<Settings />} />
        <Route path="logs" element={<SystemLog />} />
        <Route path="reports" element={<Reports />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
