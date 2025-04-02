
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Quiz from "./pages/Quiz";
import QuizReviewPage from "./pages/QuizReview";
import NotFound from "./pages/NotFound";
import UsersPage from "./pages/admin/Users";
import SettingsPage from "./pages/admin/Settings";
import { QuizSuccess } from "./components/quiz/QuizSuccess";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/quiz/review" element={<QuizReviewPage />} />
            <Route path="/quiz/success" element={<QuizSuccess />} />
            
            {/* Rotas Admin */}
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/users" element={<UsersPage />} />
            <Route path="/admin/users/new" element={<UsersPage />} />
            <Route path="/admin/settings" element={<SettingsPage />} />
            <Route path="/admin/data" element={<Dashboard />} /> {/* Temporário, redireciona para dashboard */}
            <Route path="/admin/reports" element={<Dashboard />} /> {/* Temporário, redireciona para dashboard */}
            <Route path="/admin/help" element={<Dashboard />} /> {/* Temporário, redireciona para dashboard */}
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
