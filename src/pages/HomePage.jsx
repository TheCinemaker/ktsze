import React from 'react';
import { HeroSection } from '../components/public/HeroSection';
import { AboutSection } from '../components/public/AboutSection';
import { ProjectsNews } from '../components/public/ProjectsNews';
import { MembershipInfo } from '../components/public/MembershipInfo';
import { ContactSection } from '../components/public/ContactSection';

export const HomePage = ({ setActiveTab }) => {
  return (
    <div className="space-y-0">
      <HeroSection setActiveTab={setActiveTab} />
      <AboutSection setActiveTab={setActiveTab} />
      <ProjectsNews />
      <MembershipInfo setActiveTab={setActiveTab} />
      <ContactSection />
    </div>
  );
};
