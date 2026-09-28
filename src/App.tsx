import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TopBar } from './core/components/TopBar';
import { ToastNotice } from './core/components/ToastNotice';
import { DemoToolsDrawer } from './core/components/DemoToolsDrawer';
import { HomePage } from './pages/HomePage';
import { JourneyPage } from './pages/JourneyPage';
import { HistoryPage } from './pages/HistoryPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col font-sans bg-[#FBF8F4] text-[#2B2233]">
        <TopBar />
        <ToastNotice />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/journey/:topicId" element={<JourneyPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <DemoToolsDrawer />
      </div>
    </BrowserRouter>
  );
}
