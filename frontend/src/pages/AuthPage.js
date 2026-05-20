import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login, register } from '../utils/api';
import { Btn, FormGroup, Alert } from '../components/UI';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { saveAuth } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setError('');
    if (!form.email || !form.password) { setError('Email and password required'); return; }
    setLoading(true);
    try {
      const res = mode === 'login'
        ? await login({ email: form.email, password: form.password })
        : await register({ name: form.name, email: form.email, password: form.password, phone: form.phone });
      saveAuth(res.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const keyDown = (e) => { if (e.key === 'Enter') submit(); };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'fixed', top: '-20%', right: '-10%',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 36, color: 'var(--gold)', marginBottom: 12, lineHeight: 1 }}>◈</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em' }}>
            Kuberi<span style={{ color: 'var(--gold)' }}>Gold</span>
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: 14, marginTop: 8 }}>Digital gold investment platform</p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg-2)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '32px 28px',
        }}>
          {/* Tabs */}
          <div style={{
            display: 'flex', background: 'var(--bg-3)',
            borderRadius: 'var(--radius-sm)', padding: 3, marginBottom: 24,
          }}>
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); }}
                style={{
                  flex: 1, padding: '8px', borderRadius: 6,
                  background: mode === m ? 'var(--bg-2)' : 'transparent',
                  border: mode === m ? '1px solid var(--border)' : '1px solid transparent',
                  color: mode === m ? 'var(--text)' : 'var(--text-2)',
                  fontSize: 14, fontWeight: mode === m ? 500 : 400,
                  transition: 'all 0.2s', fontFamily: 'var(--font-body)',
                }}>
                {m === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          <Alert message={error} type="error" onClose={() => setError('')} />

          {mode === 'register' && (
            <FormGroup label="Full name">
              <input type="text" placeholder="Ajitesh Kumar" value={form.name} onChange={set('name')} onKeyDown={keyDown} />
            </FormGroup>
          )}

          <FormGroup label="Email">
            <input type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} onKeyDown={keyDown} />
          </FormGroup>

          <FormGroup label="Password">
            <input type="password" placeholder="••••••••" value={form.password} onChange={set('password')} onKeyDown={keyDown} />
          </FormGroup>

          {mode === 'register' && (
            <FormGroup label="Phone (optional)">
              <input type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={set('phone')} onKeyDown={keyDown} />
            </FormGroup>
          )}

          <Btn onClick={submit} disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 8, padding: '12px' }}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign in →' : 'Create account →'}
          </Btn>
        </div>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--text-3)' }}>
          Minimum investment ₹10 · Powered by live metal prices
        </p>
      </div>
    </div>
  );
}
