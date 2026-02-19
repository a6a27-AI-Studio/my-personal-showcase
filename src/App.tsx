import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Contexts
import { AuthProvider } from "@/contexts/AuthContext";
import { DataClientProvider } from "@/contexts/DataClientContext";

// Layout
import { MainLayout } from "@/components/layout/MainLayout";
import { AdminGuard } from "@/components/guards/AdminGuard";

// Pages
import Index from "./pages/Index";
import AboutPage from "./pages/AboutPage";
import SkillsPage from "./pages/SkillsPage";
import ServicesPage from "./pages/ServicesPage";
import PortfolioListPage from "./pages/PortfolioListPage";
import PortfolioDetailPage from "./pages/PortfolioDetailPage";
import ContactPage from "./pages/ContactPage";
import AuthCallback from "./pages/AuthCallback";
import ForbiddenPage from "./pages/ForbiddenPage";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AboutEditor from "./pages/admin/AboutEditor";
import SkillsManager from "./pages/admin/SkillsManager";
import ServicesManager from "./pages/admin/ServicesManager";
import PortfolioManager from "./pages/admin/PortfolioManager";
import ResumeManager from "./pages/admin/ResumeManager";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <DataClientProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <Routes>
              <Route element={<MainLayout />}>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/skills" element={<SkillsPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/portfolio" element={<PortfolioListPage />} />
                <Route path="/portfolio/:slug" element={<PortfolioDetailPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/403" element={<ForbiddenPage />} />

                {/* Admin Routes (Protected) */}
                <Route
                  path="/admin"
                  element={
                    <AdminGuard>
                      <AdminDashboard />
                    </AdminGuard>
                  }
                />
                <Route
                  path="/admin/about"
                  element={
                    <AdminGuard>
                      <AboutEditor />
                    </AdminGuard>
                  }
                />
                <Route
                  path="/admin/skills"
                  element={
                    <AdminGuard>
                      <SkillsManager />
                    </AdminGuard>
                  }
                />
                <Route
                  path="/admin/services"
                  element={
                    <AdminGuard>
                      <ServicesManager />
                    </AdminGuard>
                  }
                />
                <Route
                  path="/admin/portfolio"
                  element={
                    <AdminGuard>
                      <PortfolioManager />
                    </AdminGuard>
                  }
                />
                <Route
                  path="/admin/resume"
                  element={
                    <AdminGuard>
                      <ResumeManager />
                    </AdminGuard>
                  }
                />

                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </DataClientProvider>
  </QueryClientProvider>
);

export default App;
