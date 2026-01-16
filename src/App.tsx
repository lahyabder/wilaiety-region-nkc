import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import FacilityDetails from "./pages/FacilityDetails";
import AddFacility from "./pages/AddFacility";
import MapPage from "./pages/MapPage";
import LicensesPage from "./pages/LicensesPage";
import ReportsPage from "./pages/ReportsPage";
import LoginPage from "./pages/LoginPage";
import UsersPage from "./pages/UsersPage";
import SettingsPage from "./pages/SettingsPage";
import ActivityLogsPage from "./pages/ActivityLogsPage";
import SectorFacilitiesPage from "./pages/SectorFacilitiesPage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <div className="min-h-screen">
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<LoginPage />} />
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/facility/:id" element={<ProtectedRoute><FacilityDetails /></ProtectedRoute>} />
              <Route path="/add-facility" element={<ProtectedRoute><AddFacility /></ProtectedRoute>} />
              <Route path="/map" element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
              <Route path="/licenses" element={<ProtectedRoute><LicensesPage /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
              <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/activity-logs" element={<ProtectedRoute><ActivityLogsPage /></ProtectedRoute>} />
              <Route path="/sector/:sector" element={<ProtectedRoute><SectorFacilitiesPage /></ProtectedRoute>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </div>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
