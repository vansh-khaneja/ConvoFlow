'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { LoadingSpinner } from '@/components/ui-kit/loading-spinner';
import { MainContent } from '@/components/home/MainContent';
import { WelcomeForm } from '@/components/home/WelcomeForm';

export default function Home() {
  const [userName, setUserName] = useState('');
  const [showWelcomeForm, setShowWelcomeForm] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedName = document.cookie
      .split('; ')
      .find((row) => row.startsWith('convoflow_username='))
      ?.split('=')[1];

    if (savedName) {
      setUserName(decodeURIComponent(savedName));
    } else {
      setShowWelcomeForm(true);
    }
  }, []);

  // Listen for navigation to logs tab from deployment sidebar
  useEffect(() => {
    const handleNavigateToLogs = (event: CustomEvent) => {
      setActiveTab('logs');
    };

    window.addEventListener('navigateToLogs', handleNavigateToLogs as EventListener);
    return () => {
      window.removeEventListener('navigateToLogs', handleNavigateToLogs as EventListener);
    };
  }, []);

  const handleWelcomeSubmit = (name: string) => {
    setUserName(name);
    setShowWelcomeForm(false);
    document.cookie = `convoflow_username=${encodeURIComponent(name)}; path=/; max-age=${60 * 60 * 24 * 365}`;
  };

  if (showWelcomeForm) {
    return <WelcomeForm onSubmit={handleWelcomeSubmit} />;
  }

  // Prevent hydration mismatch by only rendering after mount
  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: '#0D0C14', color: '#a1a1aa' }}>
        <LoadingSpinner size="lg" text="Loading ..." />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex h-screen bg-[var(--background)] pt-16">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div 
          className="flex-1 transition-all duration-300 ease-default lg:ml-[256px]"
        >
          <div className="pt-12 lg:pt-0">
            <MainContent userName={userName} activeTab={activeTab} />
          </div>
        </div>
      </div>
    </>
  );
}
