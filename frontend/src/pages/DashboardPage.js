import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPortfolio, getLivePrice } from '../utils/api';
import { MetricCard, Card, Spinner, Badge, PageHeader, Btn } from '../components/UI';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const [portfolio, setPortfolio] = useState(null);
  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getPortfolio(), getLivePrice()])
      .then(([p, pr]) => {
        setPortfolio(p.data);
        setPrice(pr.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const wallet = portfolio?.wallet || {};
  const pnlPositive = (wallet.pnl || 0) >= 0;
  const recentTx = (portfolio?.transactions || []).slice(0, 5);

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  const fmtG = (n) => `${Number(n || 0).toFixed(4)}g`;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div>
      <PageHeader
        title={`${greeting}, ${user?.name?.split(' ')[0] || 'Investor'} ✦`}
        sub="Here's your gold portfolio at a glance."
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn variant="secondary" small onClick={() => navigate('/trade')}>Sell</Btn>
            <Btn small onClick={() => navigate('/trade')}>Buy Gold</Btn>
          </div>
        }
      />

      {/* Live price banner */}
      {price && (
        <div style={{
          background: 'var(--gold-muted)', border: '1px solid var(--gold-border)',
          borderRadius: 'var(--radius)', padding: '14px 20px', marginBottom: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: 'var(--gold)', fontSize: 18 }}>◉</span>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Live Gold Price</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--gold)', fontFamily: 'var(--font-display)', lineHeight: 1.2 }}>
                {fmt(price.pricePerGram)} <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-2)' }}>/ gram</span>
              </div>
            </div>
          </div>
          <Btn small variant="secondary" onClick={() => navigate('/price')}>View chart →</Btn>
        </div>
      )}

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
        <MetricCard label="Gold Held" value={fmtG(wallet.totalGrams)} sub="Total grams in wallet" icon="◈" />
        <MetricCard label="Total Invested" value={fmt(wallet.totalInvested)} sub="Amount deployed" icon="↑" />
        <MetricCard label="Current Value" value={fmt(wallet.currentValue)} sub="At live price" icon="◉" />
        <MetricCard
          label="P&L"
          value={`${pnlPositive ? '+' : ''}${fmt(wallet.pnl)}`}
          sub={`${pnlPositive ? '+' : ''}${(wallet.pnlPercent || 0).toFixed(2)}% all time`}
          color={pnlPositive ? 'var(--green)' : 'var(--red)'}
          icon={pnlPositive ? '▲' : '▼'}
        />
      </div>

      {/* Recent transactions + quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>
        {/* Recent transactions */}
        <Card>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Recent Transactions</h3>
          {recentTx.length === 0 ? (
            <p style={{ color: 'var(--text-3)', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>No transactions yet — buy some gold!</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Type', 'Amount', 'Grams', 'Price/g', 'Status', 'Date'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--text-3)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentTx.map(tx => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 8px' }}>
                      <Badge color={tx.type === 'BUY' ? 'green' : 'red'}>{tx.type}</Badge>
                    </td>
                    <td style={{ padding: '10px 8px', fontWeight: 500 }}>{fmt(tx.amountInINR)}</td>
                    <td style={{ padding: '10px 8px', color: 'var(--gold)' }}>{fmtG(tx.goldInGrams)}</td>
                    <td style={{ padding: '10px 8px', color: 'var(--text-2)' }}>{fmt(tx.pricePerGram)}</td>
                    <td style={{ padding: '10px 8px' }}>
                      <Badge color={tx.status === 'COMPLETED' ? 'green' : tx.status === 'FAILED' ? 'red' : 'gray'}>
                        {tx.status}
                      </Badge>
                    </td>
                    <td style={{ padding: '10px 8px', color: 'var(--text-2)' }}>
                      {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {portfolio?.transactions?.length > 5 && (
            <div style={{ marginTop: 12, textAlign: 'right' }}>
              <Btn variant="ghost" small onClick={() => navigate('/portfolio')}>View all →</Btn>
            </div>
          )}
        </Card>

        {/* Quick actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { icon: '✦', label: 'AI Advisor', desc: 'Get AI-powered gold investment advice', to: '/advisor', color: 'var(--gold)' },
            { icon: '↻', label: 'Setup SIP', desc: 'Automate recurring gold investments', to: '/sip', color: 'var(--green)' },
            { icon: '◎', label: 'Price Alerts', desc: 'Get notified at your target price', to: '/alerts', color: '#4A9EFF' },
            { icon: '⊕', label: 'Webhooks', desc: 'Connect external apps to events', to: '/webhooks', color: 'var(--text-2)' },
          ].map(item => (
            <Card key={item.to} style={{ cursor: 'pointer', padding: '14px 16px' }} onClick={() => navigate(item.to)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8, background: 'var(--bg-3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, color: item.color, flexShrink: 0,
                }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.4 }}>{item.desc}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
