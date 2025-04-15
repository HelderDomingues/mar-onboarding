import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Profile } from "./pages/Profile";
import { AdminRoute } from "./components/admin/AdminRoute";
import { UserManagement } from "./pages/admin/UserManagement";
import { Quiz } from "./pages/Quiz";
import { ViewAnswers } from "./pages/ViewAnswers";
import { Reports } from "./pages/admin/Reports";
import { Materials } from "./pages/Materials";
import { Onboarding } from "./pages/Onboarding";
import { Pricing } from "./pages/Pricing";
import { Contact } from "./pages/Contact";
import { Terms } from "./pages/Terms";
import { Privacy } from "./pages/Privacy";
import { NotFound } from "./pages/NotFound";
import { PricingTable } from "./components/home/PricingTable";
import { WebhookTester } from "./pages/admin/WebhookTester";
import { QuizEditor } from "./pages/admin/QuizEditor";
import SeedQuiz from "./pages/admin/SeedQuiz";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/quiz/view-answers" element={<ViewAnswers />} />
          <Route path="/materials" element={<Materials />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/pricing-table" element={<PricingTable />} />
          <Route path="/admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
          <Route path="/admin/reports" element={<AdminRoute><Reports /></AdminRoute>} />
          <Route path="/admin/webhook-tester" element={<AdminRoute><WebhookTester /></AdminRoute>} />
          <Route path="/admin/quiz-editor" element={<AdminRoute><QuizEditor /></AdminRoute>} />
          
          {/* Rota para importação de dados do questionário */}
          <Route
            path="/admin/seed-quiz"
            element={
              <AdminRoute>
                <SeedQuiz />
              </AdminRoute>
            }
          />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
