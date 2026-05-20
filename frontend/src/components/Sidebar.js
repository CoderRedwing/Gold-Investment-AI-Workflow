import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const NAV = [
  { to: '/dashboard', icon: '◈', label: 'Dashboard' },
  { to: '/trade', icon: '⇅', label: 'Trade' },
  { to: '/portfolio', icon: '▣', label: 'Portfolio' },
  { to: '/price', icon: '◉', label: 'Price Chart' },
  { to: '/sip', icon: '↻', label: 'SIP Plans' },
  { to: '/alerts', icon: '◎', label: 'Price Alerts' },
  { to: '/advisor', icon: '✦', label: 'AI Advisor' },
  { to: '/webhooks', icon: '⊕', label: 'Webhooks' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'KG';

  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        <span className="sidebar__logo-mark">◈</span>
        <span className="sidebar__logo-text">Kuberi<span>Gold</span></span>
      </div>

      <nav className="sidebar__nav">
        {NAV.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `sidebar__link ${isActive ? 'active' : ''}`}>
            <span className="sidebar__icon">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__user">
          <div className="sidebar__avatar">{initials}</div>
          <div className="sidebar__user-info">
            <span className="sidebar__user-name">{user?.name}</span>
            <span className="sidebar__user-email">{user?.email}</span>
          </div>
        </div>
        <button className="sidebar__logout" onClick={handleLogout}>Sign out</button>
      </div>
    </aside>
  );
}
