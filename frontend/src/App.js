import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppLayout from './pages/AppLayout';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import TradePage from './pages/TradePage';
import PortfolioPage from './pages/PortfolioPage';
import PricePage from './pages/PricePage';
import SIPPage from './pages/SIPPage';
import AlertsPage from './pages/AlertsPage';
import AdvisorPage from './pages/AdvisorPage';
import WebhooksPage from './pages/WebhooksPage';
import './index.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/trade" element={<TradePage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/price" element={<PricePage />} />
            <Route path="/sip" element={<SIPPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/advisor" element={<AdvisorPage />} />
            <Route path="/webhooks" element={<WebhooksPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
