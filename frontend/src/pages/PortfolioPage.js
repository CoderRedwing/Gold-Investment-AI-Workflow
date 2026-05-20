import React, { useState, useEffect } from 'react';
import { getPortfolio } from '../utils/api';
import { PageHeader, MetricCard, Card, Spinner, Badge } from '../components/UI';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    getPortfolio().then(r => setPortfolio(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

  if (loading) return <Spinner />;

  const wallet = portfolio?.wallet || {};
  const txs = portfolio?.transactions || [];
  const pnlPositive = (wallet.pnl || 0) >= 0;
  const filtered = filter === 'ALL' ? txs : txs.filter(t => t.type === filter);

  const buys = txs.filter(t => t.type === 'BUY').reduce((a, t) => a + t.amountInINR, 0);
  const sells = txs.filter(t => t.type === 'SELL').reduce((a, t) => a + t.amountInINR, 0);
  const pieData = [
    { name: 'Invested', value: parseFloat(wallet.totalInvested || 0), color: '#C9A84C' },
    { name: 'Profit', value: Math.max(0, wallet.pnl || 0), color: '#4CAF7A' },
  ].filter(d => d.value > 0);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
        <div style={{ color: 'var(--text-2)' }}>{payload[0].name}</div>
        <div style={{ color: 'var(--text)', fontWeight: 600 }}>{fmt(payload[0].value)}</div>
      </div>
    );
  };

  return (
    <div>
      <PageHeader title="Portfolio" sub="Your complete gold investment overview and transaction history." />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 24 }}>
        <MetricCard label="Gold Holdings" value={`${Number(wallet.totalGrams || 0).toFixed(4)}g`} sub="Current balance" icon="◈" color="var(--gold)" />
        <MetricCard label="Avg Buy Price" value={fmt(buys / Math.max(txs.filter(t => t.type === 'BUY').length, 1))} sub="Per gram avg cost" icon="↑" />
        <MetricCard label="Total Invested" value={fmt(wallet.totalInvested)} sub="Capital deployed" icon="▣" />
        <MetricCard label="Current Value" value={fmt(wallet.currentValue)} sub="At live price" icon="◉" />
        <MetricCard
          label="Unrealised P&L"
          value={`${pnlPositive ? '+' : ''}${fmt(wallet.pnl)}`}
          sub={`${(wallet.pnlPercent || 0).toFixed(2)}% return`}
          color={pnlPositive ? 'var(--green)' : 'var(--red)'}
          icon={pnlPositive ? '▲' : '▼'}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 20, alignItems: 'start', marginBottom: 24 }}>
        {/* Allocation chart */}
        <Card>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Allocation</h3>
          {pieData.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={38} outerRadius={60} paddingAngle={3}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {pieData.map(d => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{d.name}</div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{fmt(d.value)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--text-3)', fontSize: 14 }}>No data — start buying gold.</p>
          )}
        </Card>

        {/* Summary */}
        <Card>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Summary</h3>
          {[
            { label: 'Total Buys', value: txs.filter(t => t.type === 'BUY').length },
            { label: 'Total Sells', value: txs.filter(t => t.type === 'SELL').length },
            { label: 'Total Bought', value: fmt(buys) },
            { label: 'Total Sold', value: fmt(sells) },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
              <span style={{ color: 'var(--text-2)' }}>{label}</span>
              <span style={{ fontWeight: 500 }}>{value}</span>
            </div>
          ))}
        </Card>
      </div>

      {/* Transactions table */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600 }}>All Transactions ({txs.length})</h3>
          <div style={{ display: 'flex', gap: 6 }}>
            {['ALL', 'BUY', 'SELL'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '5px 12px', borderRadius: 6, fontSize: 12,
                background: filter === f ? 'var(--gold-muted)' : 'var(--bg-3)',
                border: `1px solid ${filter === f ? 'var(--gold-border)' : 'var(--border)'}`,
                color: filter === f ? 'var(--gold)' : 'var(--text-2)',
                cursor: 'pointer', fontFamily: 'var(--font-body)',
              }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p style={{ color: 'var(--text-3)', textAlign: 'center', padding: '30px', fontSize: 14 }}>No transactions.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['#', 'Type', 'Amount (INR)', 'Gold (g)', 'Price/g', 'Status', 'Date'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px', color: 'var(--text-3)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(tx => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '11px 8px', color: 'var(--text-3)' }}>#{tx.id}</td>
                    <td style={{ padding: '11px 8px' }}><Badge color={tx.type === 'BUY' ? 'green' : 'red'}>{tx.type}</Badge></td>
                    <td style={{ padding: '11px 8px', fontWeight: 500 }}>{fmt(tx.amountInINR)}</td>
                    <td style={{ padding: '11px 8px', color: 'var(--gold)' }}>{Number(tx.goldInGrams).toFixed(4)}g</td>
                    <td style={{ padding: '11px 8px', color: 'var(--text-2)' }}>{fmt(tx.pricePerGram)}</td>
                    <td style={{ padding: '11px 8px' }}>
                      <Badge color={tx.status === 'COMPLETED' ? 'green' : tx.status === 'FAILED' ? 'red' : 'gray'}>{tx.status}</Badge>
                    </td>
                    <td style={{ padding: '11px 8px', color: 'var(--text-2)' }}>
                      {new Date(tx.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
