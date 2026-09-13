/**
 * NLAMS — National Land Acquisition & Management System
 * Production-grade frontend for Smart India Hackathon Problem Statement 26016.
 * Incorporates all 20 signature effects, 5 role-scoped portals, public landing page,
 * Light/Dark mode tokens, Dignified Split-Screen Login, and Persistent Profile Badge.
 */

import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ToastProvider } from './components/effects/ToastProvider';
import { TopProgressBar } from './components/effects/TopProgressBar';
import { StickyNav } from './components/effects/StickyNav';
import { PageTransition } from './components/effects/PageTransition';
import { LandingPage } from './components/landing/LandingPage';
import { DemoWorkbench } from './components/demo/DemoWorkbench';
import { LoginPage } from './components/auth/LoginPage';
import { ThemeProvider } from './components/theme/ThemeProvider';
import { MOCK_OFFICERS, AuthOfficer } from './types/auth';

function getOfficerForPortal(portalId: string): AuthOfficer {
  switch (portalId) {
    case 'state':
      return MOCK_OFFICERS['state-admin'];
    case 'district':
      return MOCK_OFFICERS['district-collector'];
    case 'field':
      return MOCK_OFFICERS['field-officer'];
    case 'policy':
      return MOCK_OFFICERS['policy-maker'];
    case 'central':
    default:
      return MOCK_OFFICERS['central-admin'];
  }
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isNavigating, setIsNavigating] = useState(false);
  const [selectedPortalForDemo, setSelectedPortalForDemo] = useState<string>('central');
  const [currentUser, setCurrentUser] = useState<AuthOfficer | null>(MOCK_OFFICERS['central-admin']);

  // Trigger top route progress bar on path change (Effect #18)
  useEffect(() => {
    setIsNavigating(true);
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const isDemoPage = location.pathname.startsWith('/demo');
  const isLoginPage = location.pathname.startsWith('/login');

  const handleNavigateToDemo = (portalId: string = 'central') => {
    setSelectedPortalForDemo(portalId);
    setCurrentUser(getOfficerForPortal(portalId));
    navigate('/demo');
  };

  const handleLoginSuccess = (officer: AuthOfficer) => {
    setCurrentUser(officer);
    setSelectedPortalForDemo(officer.portalId);
    navigate('/demo');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/login');
  };

  const handlePortalChangeInDemo = (portalId: string) => {
    setSelectedPortalForDemo(portalId);
    setCurrentUser(getOfficerForPortal(portalId));
  };

  const getActiveView = (): 'landing' | 'demo' | 'login' => {
    if (isLoginPage) return 'login';
    if (isDemoPage) return 'demo';
    return 'landing';
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface,#f7f9fb)] text-[var(--color-text,#1c2530)] flex flex-col selection:bg-[#0ea5a3]/20 selection:text-[#0b2c52] transition-colors duration-300">
      {/* Effect #18: Top-of-page route-loading progress bar */}
      <TopProgressBar isNavigating={isNavigating} />

      {/* Effect #12 & #20: Sticky Nav with ThemeToggle & ProfileBadge (hidden on dedicated login page) */}
      {!isLoginPage && (
        <StickyNav
          activeView={getActiveView()}
          onOpenSignIn={() => navigate('/login')}
          onOpenDemo={() => handleNavigateToDemo('central')}
          isDemoActive={isDemoPage}
          currentUser={isDemoPage ? currentUser : null}
          onLogout={handleLogout}
          onNavigateHome={() => navigate('/')}
        />
      )}

      {/* Main Routed Content with Page Transitions (Effect #10) */}
      <main className="flex-1">
        <PageTransition key={location.pathname}>
          <Routes>
            <Route
              path="/"
              element={<LandingPage onNavigateToDemo={handleNavigateToDemo} />}
            />
            <Route
              path="/login"
              element={
                <LoginPage
                  onLoginSuccess={handleLoginSuccess}
                  onNavigateLanding={() => navigate('/')}
                />
              }
            />
            <Route
              path="/demo"
              element={
                <DemoWorkbench
                  initialPortal={selectedPortalForDemo}
                  onBackToHome={() => navigate('/')}
                  onActivePortalChange={handlePortalChangeInDemo}
                />
              }
            />
            {/* Fallback route */}
            <Route
              path="*"
              element={<LandingPage onNavigateToDemo={handleNavigateToDemo} />}
            />
          </Routes>
        </PageTransition>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <HashRouter>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </HashRouter>
    </ThemeProvider>
  );
}
