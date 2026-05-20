import React from 'react';

export function Card({ children, style, className = '' }) {
  return (
    <div className={`card ${className}`} style={{
      background: 'var(--bg-2)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '20px',
      ...style
    }}>
      {children}
    </div>
  );
}

export function MetricCard({ label, value, sub, color, icon }) {
  return (
    <div style={{
      background: 'var(--bg-3)',
      borderRadius: 'var(--radius)',
      padding: '16px 20px',
      border: '1px solid var(--border)',
    }}>
      <div style={{ fontSize: 12, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
        {icon && <span>{icon}</span>}
        {label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-display)', color: color || 'var(--text)', lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

export function Btn({ children, onClick, variant = 'primary', disabled, style, small }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: small ? '7px 14px' : '10px 20px',
    borderRadius: 'var(--radius-sm)',
    fontSize: small ? 13 : 14,
    fontWeight: 500,
    transition: 'all 0.15s',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    border: 'none',
    fontFamily: 'var(--font-body)',
    ...style,
  };
  const variants = {
    primary: { background: 'var(--gold)', color: '#0A0A0A' },
    secondary: { background: 'var(--bg-4)', color: 'var(--text)', border: '1px solid var(--border)' },
    danger: { background: 'var(--red-bg)', color: 'var(--red)', border: '1px solid rgba(224,82,82,0.3)' },
    ghost: { background: 'transparent', color: 'var(--text-2)', border: '1px solid var(--border)' },
    green: { background: 'var(--green-bg)', color: 'var(--green)', border: '1px solid rgba(76,175,122,0.3)' },
  };
  return (
    <button style={{ ...base, ...variants[variant] }} onClick={disabled ? undefined : onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export function Badge({ children, color = 'gold' }) {
  const colors = {
    gold: { bg: 'var(--gold-muted)', text: 'var(--gold)', border: 'var(--gold-border)' },
    green: { bg: 'var(--green-bg)', text: 'var(--green)', border: 'rgba(76,175,122,0.3)' },
    red: { bg: 'var(--red-bg)', text: 'var(--red)', border: 'rgba(224,82,82,0.3)' },
    gray: { bg: 'var(--bg-4)', text: 'var(--text-2)', border: 'var(--border)' },
  };
  const c = colors[color] || colors.gray;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: 100,
      fontSize: 11, fontWeight: 500, letterSpacing: '0.04em',
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
    }}>
      {children}
    </span>
  );
}

export function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
      <div style={{
        width: 28, height: 28,
        border: '2px solid var(--border)',
        borderTopColor: 'var(--gold)',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function PageHeader({ title, sub, action }) {
  return (
    <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>{title}</h1>
        {sub && <p style={{ color: 'var(--text-2)', fontSize: 14 }}>{sub}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function EmptyState({ icon, message }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-3)' }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 14 }}>{message}</div>
    </div>
  );
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--bg-2)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: 28, width: '100%', maxWidth: 440,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', color: 'var(--text-2)', fontSize: 18, lineHeight: 1, padding: 4 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function FormGroup({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12, color: 'var(--text-2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export function Alert({ type = 'error', message, onClose }) {
  const colors = {
    error: { bg: 'var(--red-bg)', text: 'var(--red)', border: 'rgba(224,82,82,0.3)' },
    success: { bg: 'var(--green-bg)', text: 'var(--green)', border: 'rgba(76,175,122,0.3)' },
  };
  const c = colors[type];
  if (!message) return null;
  return (
    <div style={{
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      borderRadius: 'var(--radius-sm)', padding: '10px 14px',
      fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      marginBottom: 16,
    }}>
      <span>{message}</span>
      {onClose && <button onClick={onClose} style={{ background: 'none', color: 'inherit', opacity: 0.7 }}>✕</button>}
    </div>
  );
}
