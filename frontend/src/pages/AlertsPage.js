import React, { useState, useEffect } from 'react';
import { getAlerts, createAlert, deleteAlert, getLivePrice } from '../utils/api';
import { PageHeader, Card, Btn, Modal, FormGroup, EmptyState, Spinner, Badge, Alert, MetricCard } from '../components/UI';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [livePrice, setLivePrice] = useState(null);
  const [form, setForm] = useState({ targetPrice: '', direction: 'ABOVE', notifyVia: 'email' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => Promise.all([getAlerts(), getLivePrice()])
    .then(([a, p]) => { setAlerts(a.data); setLivePrice(p.data.pricePerGram); })
    .catch(console.error)
    .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleCreate = async () => {
    if (!form.targetPrice) { setError('Enter target price'); return; }
    setSaving(true); setError('');
    try {
      await createAlert({ targetPrice: parseFloat(form.targetPrice), direction: form.direction, notifyVia: form.notifyVia });
      setModal(false); setForm({ targetPrice: '', direction: 'ABOVE', notifyVia: 'email' });
      load();
    } catch (err) { setError(err.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    await deleteAlert(id).catch(console.error);
    load();
  };

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  const active = alerts.filter(a => !a.triggered);
  const triggered = alerts.filter(a => a.triggered);

  return (
    <div>
      <PageHeader
        title="Price Alerts"
        sub="Get notified when gold hits your target price. Checked every 5 minutes."
        action={<Btn onClick={() => setModal(true)}>+ New Alert</Btn>}
      />

      {!loading && livePrice && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14, marginBottom: 24 }}>
          <MetricCard label="Live Price" value={fmt(livePrice)} sub="Per gram now" color="var(--gold)" icon="◉" />
          <MetricCard label="Active Alerts" value={active.length} sub="Watching prices" icon="◎" />
          <MetricCard label="Triggered" value={triggered.length} sub="Already fired" icon="✓" />
        </div>
      )}

      {loading ? <Spinner /> : alerts.length === 0 ? (
        <Card style={{ textAlign: 'center' }}>
          <EmptyState icon="◎" message="No price alerts yet. Set a target and we'll notify you." />
          <div style={{ marginTop: 16 }}><Btn onClick={() => setModal(true)}>Create Alert</Btn></div>
        </Card>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {alerts.map(alert => (
            <div key={alert.id} style={{
              background: 'var(--bg-2)', border: `1px solid ${alert.triggered ? 'rgba(76,175,122,0.2)' : 'var(--border)'}`,
              borderRadius: 'var(--radius)', padding: '16px 20px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10,
              opacity: alert.triggered ? 0.7 : 1,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                  background: alert.direction === 'ABOVE' ? 'var(--green-bg)' : 'var(--red-bg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                  color: alert.direction === 'ABOVE' ? 'var(--green)' : 'var(--red)',
                }}>
                  {alert.direction === 'ABOVE' ? '▲' : '▼'}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 16 }}>{fmt(alert.targetPrice)}</span>
                    <Badge color={alert.direction === 'ABOVE' ? 'green' : 'red'}>{alert.direction}</Badge>
                    {alert.triggered && <Badge color="green">✓ TRIGGERED</Badge>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
                    Notify via {alert.notifyVia} ·
                    {livePrice && !alert.triggered && (
                      <span> {fmt(Math.abs(livePrice - alert.targetPrice))} {alert.direction === 'ABOVE' ? 'above' : 'below'} current price</span>
                    )}
                    {alert.triggeredAt && <span> · Triggered {new Date(alert.triggeredAt).toLocaleDateString('en-IN')}</span>}
                  </div>
                </div>
              </div>
              {!alert.triggered && (
                <Btn variant="danger" small onClick={() => handleDelete(alert.id)}>Remove</Btn>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => { setModal(false); setError(''); }} title="Create Price Alert">
        <Alert message={error} type="error" onClose={() => setError('')} />

        {livePrice && (
          <div style={{ background: 'var(--gold-muted)', border: '1px solid var(--gold-border)', borderRadius: 8, padding: '8px 12px', marginBottom: 16, fontSize: 13, color: 'var(--text-2)' }}>
            Current price: <strong style={{ color: 'var(--gold)' }}>{fmt(livePrice)}/g</strong>
          </div>
        )}

        <FormGroup label="Target price (INR per gram)">
          <input type="number" placeholder={livePrice ? `e.g. ${Math.round(livePrice * 1.05)}` : "e.g. 7500"} value={form.targetPrice} onChange={set('targetPrice')} />
        </FormGroup>

        <FormGroup label="Alert when price goes">
          <select value={form.direction} onChange={set('direction')}>
            <option value="ABOVE">Above target (price rises to)</option>
            <option value="BELOW">Below target (price drops to)</option>
          </select>
        </FormGroup>

        <FormGroup label="Notify via">
          <select value={form.notifyVia} onChange={set('notifyVia')}>
            <option value="email">Email</option>
            <option value="webhook">Webhook</option>
          </select>
        </FormGroup>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <Btn variant="ghost" onClick={() => setModal(false)}>Cancel</Btn>
          <Btn onClick={handleCreate} disabled={saving}>{saving ? 'Saving…' : 'Create Alert'}</Btn>
        </div>
      </Modal>
    </div>
  );
}
