
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
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
import WixRedirect from "@/pages/WixRedirect";
import MAREmbed from "@/pages/MAREmbed";

// Admin pages
import ImportUsers from "@/pages/admin/ImportUsers";
import NewUser from "@/pages/admin/NewUser";
import Settings from "@/pages/admin/Settings";
import Users from "@/pages/admin/Users";
import Reports from "@/pages/admin/Reports";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<IndexPage />} />

      {/* Redirecionar para a página WixRedirect após autenticação */}
      <Route path="/dashboard" element={<ProtectedRoute component={WixRedirect} />} />
      
      {/* Página principal que incorpora o MAR */}
      <Route path="/mar" element={<ProtectedRoute component={MAREmbed} />} />
      <Route path="/wix-redirect" element={<ProtectedRoute component={WixRedirect} />} />
      
      {/* Manter as rotas antigas para compatibilidade */}
      <Route path="/quiz" element={<ProtectedRoute component={Quiz} />} />
      <Route path="/quiz/review" element={<ProtectedRoute component={QuizReview} />} />
      <Route path="/quiz/view-answers" element={<ProtectedRoute component={QuizViewAnswers} />} />
      <Route path="/quiz/answers" element={<ProtectedRoute component={QuizViewAnswers} />} />
      <Route path="/quiz/diagnostic" element={<ProtectedRoute component={QuizDiagnostic} />} />
      <Route path="/quiz/success" element={<ProtectedRoute component={QuizDiagnostic} />} />
      <Route path="/materials" element={<ProtectedRoute component={Materials} />} />
      <Route path="/member" element={<ProtectedRoute component={MemberArea} />} />
      <Route path="/faq" element={<ProtectedRoute component={FAQ} />} />

      {/* Admin routes */}
      <Route path="/admin" element={<AdminRoute />}>
        <Route path="users" element={<Users />} />
        <Route path="users/new" element={<NewUser />} />
        <Route path="users/import" element={<ImportUsers />} />
        <Route path="settings" element={<Settings />} />
        <Route path="reports" element={<Reports />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
