import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { Spinner } from '../components/UI';

export default function AppLayout() {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}><Spinner /></div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{
        flex: 1,
        marginLeft: 220,
        padding: '36px 40px',
        minHeight: '100vh',
        background: 'var(--bg)',
        maxWidth: 'calc(100vw - 220px)',
      }}>
        <Outlet />
      </main>
    </div>
  );
}
