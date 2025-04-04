
import React from "react";
import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/routes/ProtectedRoute";
import { AdminRoute } from "@/components/routes/AdminRoute";

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

// Admin pages
import ImportUsers from "@/pages/admin/ImportUsers";
import NewUser from "@/pages/admin/NewUser";
import Settings from "@/pages/admin/Settings";
import Users from "@/pages/admin/Users";

export function AppRoutes() {
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

      {/* Admin routes */}
      <Route path="/admin/users" element={<AdminRoute component={Users} />} />
      <Route path="/admin/users/new" element={<AdminRoute component={NewUser} />} />
      <Route path="/admin/users/import" element={<AdminRoute component={ImportUsers} />} />
      <Route path="/admin/settings" element={<AdminRoute component={Settings} />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
