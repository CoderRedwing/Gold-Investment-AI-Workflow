import React, { useState, useEffect } from 'react';
import { buyGold, sellGold, getLivePrice, getPortfolio } from '../utils/api';
import { Card, Btn, PageHeader, FormGroup, Alert, MetricCard, Spinner } from '../components/UI';

export default function TradePage() {
  const [mode, setMode] = useState('buy');
  const [amount, setAmount] = useState('');
  const [grams, setGrams] = useState('');
  const [price, setPrice] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [priceLoading, setPriceLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getLivePrice(), getPortfolio()])
      .then(([p, port]) => {
        setPrice(p.data.pricePerGram);
        setWallet(port.data.wallet);
      })
      .catch(console.error)
      .finally(() => setPriceLoading(false));
  }, []);

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

  const buyPreview = amount && price ? (parseFloat(amount) / price).toFixed(4) : '—';
  const sellPreview = grams && price ? (parseFloat(grams) * price).toFixed(2) : '—';

  const handleBuy = async () => {
    if (!amount || parseFloat(amount) < 10) { setError('Minimum investment is ₹10'); return; }
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await buyGold(parseFloat(amount));
      setSuccess(`✓ Purchased ${res.data.goldInGrams}g gold for ${fmt(res.data.amountSpent)}`);
      setAmount('');
      const port = await getPortfolio();
      setWallet(port.data.wallet);
    } catch (err) { setError(err.message || 'Purchase failed'); }
    finally { setLoading(false); }
  };

  const handleSell = async () => {
    if (!grams || parseFloat(grams) <= 0) { setError('Enter grams to sell'); return; }
    if (wallet && parseFloat(grams) > wallet.totalGrams) { setError(`You only have ${wallet.totalGrams}g available`); return; }
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await sellGold(parseFloat(grams));
      setSuccess(`✓ Sold ${res.data.goldSoldGrams}g gold for ${fmt(res.data.amountReceived)}`);
      setGrams('');
      const port = await getPortfolio();
      setWallet(port.data.wallet);
    } catch (err) { setError(err.message || 'Sale failed'); }
    finally { setLoading(false); }
  };

  const PRESETS_BUY = [100, 500, 1000, 5000];
  const PRESETS_SELL = [0.1, 0.5, 1, 5];

  return (
    <div>
      <PageHeader title="Trade Gold" sub="Buy or sell digital gold at live market prices." />

      {priceLoading ? <Spinner /> : (
        <>
          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 28 }}>
            <MetricCard label="Live Price" value={price ? fmt(price) : '—'} sub="Per gram (INR)" icon="◉" color="var(--gold)" />
            <MetricCard label="Gold Held" value={`${Number(wallet?.totalGrams || 0).toFixed(4)}g`} sub="Available to sell" icon="◈" />
            <MetricCard label="Wallet Value" value={fmt(wallet?.currentValue)} sub="At current price" icon="▣" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 800 }}>
            {/* Buy */}
            <Card style={{ borderColor: mode === 'buy' ? 'var(--gold-border)' : 'var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)' }} />
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>Buy Gold</h3>
              </div>

              <Alert message={mode === 'buy' ? success : ''} type="success" onClose={() => setSuccess('')} />
              <Alert message={mode === 'buy' ? error : ''} type="error" onClose={() => setError('')} />

              <FormGroup label="Amount in INR">
                <input type="number" min="10" placeholder="₹ 500" value={amount} onChange={e => setAmount(e.target.value)} />
              </FormGroup>

              <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
                {PRESETS_BUY.map(p => (
                  <button key={p} onClick={() => setAmount(String(p))} style={{
                    padding: '4px 10px', fontSize: 12, borderRadius: 6,
                    background: amount == p ? 'var(--gold-muted)' : 'var(--bg-3)',
                    border: `1px solid ${amount == p ? 'var(--gold-border)' : 'var(--border)'}`,
                    color: amount == p ? 'var(--gold)' : 'var(--text-2)',
                    cursor: 'pointer', fontFamily: 'var(--font-body)',
                  }}>
                    ₹{p.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>

              {amount && price && (
                <div style={{
                  background: 'var(--bg-3)', borderRadius: 8, padding: '10px 14px',
                  marginBottom: 16, display: 'flex', justifyContent: 'space-between',
                  fontSize: 13, color: 'var(--text-2)',
                }}>
                  <span>You receive</span>
                  <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{buyPreview}g</span>
                </div>
              )}

              <Btn onClick={() => { setMode('buy'); handleBuy(); }} disabled={loading} style={{ width: '100%', justifyContent: 'center', background: 'var(--green)', color: '#fff' }}>
                {loading && mode === 'buy' ? 'Processing…' : '↑ Buy Gold'}
              </Btn>
              <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 8, textAlign: 'center' }}>Minimum ₹10 · Instant settlement</p>
            </Card>

            {/* Sell */}
            <Card style={{ borderColor: mode === 'sell' ? 'rgba(224,82,82,0.3)' : 'var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)' }} />
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>Sell Gold</h3>
              </div>

              <Alert message={mode === 'sell' ? success : ''} type="success" onClose={() => setSuccess('')} />
              <Alert message={mode === 'sell' ? error : ''} type="error" onClose={() => setError('')} />

              <FormGroup label="Grams to sell">
                <input type="number" min="0.001" step="0.001" placeholder="0.5000 g" value={grams} onChange={e => setGrams(e.target.value)} />
              </FormGroup>

              <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
                {PRESETS_SELL.map(p => (
                  <button key={p} onClick={() => setGrams(String(p))} style={{
                    padding: '4px 10px', fontSize: 12, borderRadius: 6,
                    background: grams == p ? 'var(--red-bg)' : 'var(--bg-3)',
                    border: `1px solid ${grams == p ? 'rgba(224,82,82,0.3)' : 'var(--border)'}`,
                    color: grams == p ? 'var(--red)' : 'var(--text-2)',
                    cursor: 'pointer', fontFamily: 'var(--font-body)',
                  }}>
                    {p}g
                  </button>
                ))}
                {wallet?.totalGrams > 0 && (
                  <button onClick={() => setGrams(String(wallet.totalGrams))} style={{
                    padding: '4px 10px', fontSize: 12, borderRadius: 6,
                    background: 'var(--bg-3)', border: '1px solid var(--border)',
                    color: 'var(--text-2)', cursor: 'pointer', fontFamily: 'var(--font-body)',
                  }}>
                    All ({Number(wallet.totalGrams).toFixed(4)}g)
                  </button>
                )}
              </div>

              {grams && price && (
                <div style={{
                  background: 'var(--bg-3)', borderRadius: 8, padding: '10px 14px',
                  marginBottom: 16, display: 'flex', justifyContent: 'space-between',
                  fontSize: 13, color: 'var(--text-2)',
                }}>
                  <span>You receive</span>
                  <span style={{ color: 'var(--green)', fontWeight: 600 }}>₹{parseFloat(sellPreview).toLocaleString('en-IN')}</span>
                </div>
              )}

              <Btn variant="danger" onClick={() => { setMode('sell'); handleSell(); }} disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                {loading && mode === 'sell' ? 'Processing…' : '↓ Sell Gold'}
              </Btn>
              <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 8, textAlign: 'center' }}>Holdings: {Number(wallet?.totalGrams || 0).toFixed(4)}g available</p>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
