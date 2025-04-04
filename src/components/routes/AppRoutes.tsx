
import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/routes/ProtectedRoute";
import { AdminRoute } from "@/components/routes/AdminRoute";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import Quiz from "@/pages/Quiz";
import QuizReviewPage from "@/pages/QuizReview";
import NotFound from "@/pages/NotFound";
import UsersPage from "@/pages/admin/Users";
import NewUserPage from "@/pages/admin/NewUser";
import SettingsPage from "@/pages/admin/Settings";
import ImportUsersPage from "@/pages/admin/ImportUsers";
import MemberArea from "@/pages/MemberArea";
import { QuizSuccess } from "@/components/quiz/QuizSuccess";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      
      {/* Rotas protegidas por autenticação */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/member"
        element={
          <ProtectedRoute>
            <MemberArea />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/quiz"
        element={
          <ProtectedRoute>
            <Quiz />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/quiz/review"
        element={
          <ProtectedRoute>
            <QuizReviewPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/quiz/success"
        element={
          <ProtectedRoute>
            <QuizSuccess />
          </ProtectedRoute>
        }
      />
      
      {/* Rotas Admin */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <Dashboard />
          </AdminRoute>
        }
      />
      
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <UsersPage />
          </AdminRoute>
        }
      />
      
      <Route
        path="/admin/users/new"
        element={
          <AdminRoute>
            <NewUserPage />
          </AdminRoute>
        }
      />
      
      <Route
        path="/admin/users/import"
        element={
          <AdminRoute>
            <ImportUsersPage />
          </AdminRoute>
        }
      />
      
      <Route
        path="/admin/settings"
        element={
          <AdminRoute>
            <SettingsPage />
          </AdminRoute>
        }
      />
      
      <Route
        path="/admin/data"
        element={
          <AdminRoute>
            <Dashboard />
          </AdminRoute>
        }
      />
      
      <Route
        path="/admin/reports"
        element={
          <AdminRoute>
            <Dashboard />
          </AdminRoute>
        }
      />
      
      <Route
        path="/admin/help"
        element={
          <AdminRoute>
            <Dashboard />
          </AdminRoute>
        }
      />
      
      {/* Rota 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
