import React, { useState, useEffect } from 'react';
import { getPriceHistory, getLivePrice } from '../utils/api';
import { PageHeader, MetricCard, Card, Spinner, Btn } from '../components/UI';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const PERIODS = [
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
];

export default function PricePage() {
  const [days, setDays] = useState(30);
  const [history, setHistory] = useState(null);
  const [livePrice, setLivePrice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([getPriceHistory(days), getLivePrice()])
      .then(([h, p]) => { setHistory(h.data); setLivePrice(p.data.pricePerGram); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [days]);

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

  const chartData = (history?.snapshots || []).map(s => ({
    date: new Date(s.recordedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    price: parseFloat(Number(s.pricePerGram).toFixed(2)),
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{
        background: 'var(--bg-2)', border: '1px solid var(--border)',
        borderRadius: 8, padding: '10px 14px', fontSize: 13,
      }}>
        <div style={{ color: 'var(--text-2)', marginBottom: 4 }}>{label}</div>
        <div style={{ color: 'var(--gold)', fontWeight: 600, fontFamily: 'var(--font-display)' }}>
          {fmt(payload[0].value)}/g
        </div>
      </div>
    );
  };

  return (
    <div>
      <PageHeader title="Gold Price Chart" sub="Live and historical gold prices in INR per gram." />

      {loading ? <Spinner /> : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14, marginBottom: 24 }}>
            <MetricCard label="Live Price" value={fmt(livePrice)} sub="Per gram now" color="var(--gold)" icon="◉" />
            <MetricCard label={`${days}D High`} value={fmt(history?.high)} sub="Period high" color="var(--green)" icon="▲" />
            <MetricCard label={`${days}D Low`} value={fmt(history?.low)} sub="Period low" color="var(--red)" icon="▼" />
            <MetricCard label="Snapshots" value={history?.count || 0} sub="Data points" icon="◈" />
          </div>

          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600 }}>Price History</h3>
              <div style={{ display: 'flex', gap: 6 }}>
                {PERIODS.map(p => (
                  <button key={p.days} onClick={() => setDays(p.days)} style={{
                    padding: '5px 14px', borderRadius: 6, fontSize: 13,
                    background: days === p.days ? 'var(--gold-muted)' : 'var(--bg-3)',
                    border: `1px solid ${days === p.days ? 'var(--gold-border)' : 'var(--border)'}`,
                    color: days === p.days ? 'var(--gold)' : 'var(--text-2)',
                    cursor: 'pointer', fontFamily: 'var(--font-body)',
                  }}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {chartData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-3)' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>◈</div>
                <p>No price data yet. The cron job runs daily to record snapshots.</p>
                <p style={{ fontSize: 12, marginTop: 8 }}>Or trigger manually: <code>POST /api/price/snapshot</code></p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fill: '#5A5550', fontSize: 11 }} tickLine={false} axisLine={false}
                    interval={Math.floor(chartData.length / 6)} />
                  <YAxis tick={{ fill: '#5A5550', fontSize: 11 }} tickLine={false} axisLine={false}
                    tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} width={50} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="price" stroke="#C9A84C" strokeWidth={2}
                    dot={false} activeDot={{ r: 4, fill: '#C9A84C', stroke: '#0A0A0A', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>

          <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--bg-2)', borderRadius: 8, border: '1px solid var(--border)', fontSize: 12, color: 'var(--text-3)' }}>
            ◉ Prices sourced from MetalPriceAPI · Snapshots recorded hourly via cron job · All prices in INR per gram
          </div>
        </>
      )}
    </div>
  );
}
