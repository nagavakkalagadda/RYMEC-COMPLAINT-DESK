import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { LiquidBottomNav } from './components/layout/LiquidBottomNav';
import { Footer } from './components/layout/Footer';
import { FloatingParticles } from './components/3d/FloatingParticles';
import { RoundGlassAuth } from './components/auth/RoundGlassAuth';
import { LandingHero } from './components/public/LandingHero';
import { TransparencyWall } from './components/public/TransparencyWall';
import { AboutCollege } from './components/public/AboutCollege';
import { ComplaintSubmissionForm } from './components/student/ComplaintSubmissionForm';
import { ComplaintTrackingView } from './components/student/ComplaintTrackingView';
import { StudentDashboard } from './components/student/StudentDashboard';
import { UserProfileView } from './components/student/UserProfileView';
import { StaffDashboard } from './components/staff/StaffDashboard';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { DepartmentManagement } from './components/principal/DepartmentManagement';
import { AuditLogViewer } from './components/principal/AuditLogViewer';
import { GrievanceChatbot } from './components/chatbot/GrievanceChatbot';

export function App() {
  const { user, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [authOpen, setAuthOpen] = useState(false);
  const [activeTrackingId, setActiveTrackingId] = useState<string>('');

  // Check URL query parameters on load (e.g., ?id=GRV-2026-XXXXX)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
      setActiveTrackingId(id);
      setCurrentTab('track');
    }
  }, []);

  const handleNavigate = (tab: string, param?: string) => {
    if (param && tab === 'track') {
      setActiveTrackingId(param);
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isStaff = user && ['lecturer', 'warden', 'hod', 'mentor', 'principal'].includes(user.role);

  // Render appropriate view based on tab & auth state
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <span className="h-10 w-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Initializing RYMEC Grievance Desk...
            </span>
          </div>
        </div>
      );
    }

    switch (currentTab) {
      case 'home':
        if (!user) {
          return (
            <LandingHero
              onGetStarted={() => setAuthOpen(true)}
              onTrack={() => handleNavigate('track')}
              onViewTransparency={() => handleNavigate('transparency')}
            />
          );
        }
        return isStaff ? (
          <StaffDashboard />
        ) : (
          <StudentDashboard onNavigate={handleNavigate} />
        );

      case 'overview':
        return isStaff ? <StaffDashboard /> : <StudentDashboard onNavigate={handleNavigate} />;

      case 'submit':
        return (
          <ComplaintSubmissionForm
            onSuccess={(id) => {
              setActiveTrackingId(id);
            }}
            onGoToTrack={(id) => handleNavigate('track', id)}
          />
        );

      case 'track':
        return <ComplaintTrackingView initialId={activeTrackingId} />;

      case 'history':
        return isStaff ? <StaffDashboard /> : <StudentDashboard onNavigate={handleNavigate} />;

      case 'complaints':
        return <StaffDashboard />;

      case 'analytics':
        return <AnalyticsDashboard />;

      case 'departments':
        return <DepartmentManagement />;

      case 'audit-logs':
        return <AuditLogViewer />;

      case 'transparency':
        return <TransparencyWall />;

      case 'about':
        return <AboutCollege />;

      case 'faq':
        return <GrievanceChatbot />;

      case 'profile':
        return <UserProfileView />;

      default:
        return (
          <LandingHero
            onGetStarted={() => setAuthOpen(true)}
            onTrack={() => handleNavigate('track')}
            onViewTransparency={() => handleNavigate('transparency')}
          />
        );
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between">
      {/* Background Floating Glass Particles */}
      <FloatingParticles />

      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={handleNavigate}
        onOpenAuth={() => setAuthOpen(true)}
      />

      {/* Main Content View */}
      <main className="flex-1 pb-24">
        {renderContent()}
      </main>

      {/* Footer */}
      <Footer />

      {/* Liquid Glass Bottom Navigation Bar */}
      <LiquidBottomNav
        currentTab={currentTab}
        setCurrentTab={handleNavigate}
        onOpenAuth={() => setAuthOpen(true)}
      />

      {/* Round Glass Login / Register Modal */}
      <RoundGlassAuth
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
      />
    </div>
  );
}

export default App;
