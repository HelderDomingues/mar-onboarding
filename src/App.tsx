
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ViewAsUserProvider } from "./contexts/ViewAsUserContext";
import AppRoutes from "./components/routes/AppRoutes";
import { Toaster } from "./components/ui/toaster";
import { ViewAsUserBanner } from "./components/admin/ViewAsUserBanner";

function App() {
  return (
    <Router>
      <AuthProvider>
        <ViewAsUserProvider>
          <ViewAsUserBanner />
          <AppRoutes />
          <Toaster />
        </ViewAsUserProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
