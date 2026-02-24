import { lazy, Suspense } from "react";
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

// Public Pages (lazy-loaded)
const Index = lazy(() => import("./pages/Index"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const SkillsPage = lazy(() => import("./pages/SkillsPage"));
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const PortfolioListPage = lazy(() => import("./pages/PortfolioListPage"));
const PortfolioDetailPage = lazy(() => import("./pages/PortfolioDetailPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const ForbiddenPage = lazy(() => import("./pages/ForbiddenPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Admin Pages (lazy-loaded)
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AboutEditor = lazy(() => import("./pages/admin/AboutEditor"));
const SkillsManager = lazy(() => import("./pages/admin/SkillsManager"));
const ServicesManager = lazy(() => import("./pages/admin/ServicesManager"));
const PortfolioManager = lazy(() => import("./pages/admin/PortfolioManager"));
const ResumeManager = lazy(() => import("./pages/admin/ResumeManager"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <DataClientProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <Suspense
              fallback={
                <div className="container-page flex items-center justify-center min-h-[40vh]">
                  <div className="animate-pulse text-muted-foreground">Loading...</div>
                </div>
              }
            >
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
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </DataClientProvider>
  </QueryClientProvider>
);

export default App;
