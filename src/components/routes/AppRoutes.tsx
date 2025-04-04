
import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/routes/ProtectedRoute";
import { AdminRoute } from "@/components/routes/AdminRoute";

// Páginas
import Dashboard from "@/pages/Dashboard";
import Index from "@/pages/Index";
import Quiz from "@/pages/Quiz";
import QuizReview from "@/pages/QuizReview";
import QuizDiagnostic from "@/pages/QuizDiagnostic";
import Materials from "@/pages/Materials";
import MemberArea from "@/pages/MemberArea";
import NotFound from "@/pages/NotFound";

// Páginas de Admin
import Users from "@/pages/admin/Users";
import Settings from "@/pages/admin/Settings";
import ImportUsers from "@/pages/admin/ImportUsers";
import NewUser from "@/pages/admin/NewUser";

// Novo componente para visualização do questionário
import { QuizViewAnswers } from "@/components/quiz/QuizViewAnswers";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/quiz" element={
        <ProtectedRoute>
          <Quiz />
        </ProtectedRoute>
      } />
      
      <Route path="/quiz/review" element={
        <ProtectedRoute>
          <QuizReview />
        </ProtectedRoute>
      } />
      
      <Route path="/quiz/diagnostic" element={
        <ProtectedRoute>
          <QuizDiagnostic />
        </ProtectedRoute>
      } />
      
      <Route path="/quiz/answers" element={
        <ProtectedRoute>
          <QuizViewAnswers />
        </ProtectedRoute>
      } />
      
      <Route path="/materials" element={
        <ProtectedRoute>
          <Materials />
        </ProtectedRoute>
      } />
      
      <Route path="/member" element={
        <ProtectedRoute>
          <MemberArea />
        </ProtectedRoute>
      } />
      
      {/* Rotas de administração */}
      <Route path="/admin/users" element={
        <ProtectedRoute>
          <AdminRoute>
            <Users />
          </AdminRoute>
        </ProtectedRoute>
      } />
      
      <Route path="/admin/settings" element={
        <ProtectedRoute>
          <AdminRoute>
            <Settings />
          </AdminRoute>
        </ProtectedRoute>
      } />
      
      <Route path="/admin/import" element={
        <ProtectedRoute>
          <AdminRoute>
            <ImportUsers />
          </AdminRoute>
        </ProtectedRoute>
      } />
      
      <Route path="/admin/users/new" element={
        <ProtectedRoute>
          <AdminRoute>
            <NewUser />
          </AdminRoute>
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
