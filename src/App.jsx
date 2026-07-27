import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

import { HomePage } from './pages/HomePage';
import { DocumentPublicPage } from './pages/DocumentPublicPage';
import { LoginPage } from './pages/LoginPage';
import { MemberDashboardPage } from './pages/MemberDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

import { HeroSection } from './components/public/HeroSection';
import { AboutSection } from './components/public/AboutSection';
import { ProjectsNews } from './components/public/ProjectsNews';
import { MembershipInfo } from './components/public/MembershipInfo';
import { ContactSection } from './components/public/ContactSection';

function AppContent() {
  const [activeTab, setActiveTab] = useState('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage setActiveTab={setActiveTab} />;
      case 'about':
        return (
          <div className="pt-4">
            <AboutSection setActiveTab={setActiveTab} />
          </div>
        );
      case 'news':
        return (
          <div className="pt-4">
            <ProjectsNews />
          </div>
        );
      case 'docs-public':
        return <DocumentPublicPage />;
      case 'membership':
        return (
          <div className="pt-4">
            <MembershipInfo setActiveTab={setActiveTab} />
          </div>
        );
      case 'contact':
        return (
          <div className="pt-4">
            <ContactSection />
          </div>
        );
      case 'login':
        return <LoginPage setActiveTab={setActiveTab} />;
      case 'member-dashboard':
        return <MemberDashboardPage setActiveTab={setActiveTab} />;
      case 'admin-dashboard':
        return <AdminDashboardPage setActiveTab={setActiveTab} />;
      default:
        return <HomePage setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6F0] text-[#2C221E] font-sans selection:bg-[#6B1D2F] selection:text-white">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-grow">
        {renderContent()}
      </main>
      <Footer setActiveTab={setActiveTab} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
