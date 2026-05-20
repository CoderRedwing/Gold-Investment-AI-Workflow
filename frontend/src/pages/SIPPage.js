import React, { useState, useEffect } from 'react';
import { getSIPs, createSIP, toggleSIP, deleteSIP } from '../utils/api';
import { PageHeader, Card, Btn, Modal, FormGroup, EmptyState, Spinner, Badge, Alert } from '../components/UI';

export default function SIPPage() {
  const [sips, setSips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ amountInINR: '', frequency: 'MONTHLY', dayOfWeek: '', dayOfMonth: '1' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => getSIPs().then(r => setSips(r.data)).catch(console.error).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleCreate = async () => {
    if (!form.amountInINR || parseFloat(form.amountInINR) < 100) { setError('Minimum SIP amount is ₹100'); return; }
    setSaving(true); setError('');
    try {
      await createSIP({
        amountInINR: parseFloat(form.amountInINR),
        frequency: form.frequency,
        dayOfWeek: form.frequency === 'WEEKLY' ? parseInt(form.dayOfWeek) : undefined,
        dayOfMonth: form.frequency === 'MONTHLY' ? parseInt(form.dayOfMonth) : undefined,
      });
      setSuccess('SIP plan created!'); setModal(false);
      setForm({ amountInINR: '', frequency: 'MONTHLY', dayOfWeek: '', dayOfMonth: '1' });
      load();
    } catch (err) { setError(err.message || 'Failed to create SIP'); }
    finally { setSaving(false); }
  };

  const handleToggle = async (id, cur) => {
    await toggleSIP(id, !cur).catch(console.error);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this SIP plan?')) return;
    await deleteSIP(id).catch(console.error);
    load();
  };

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div>
      <PageHeader
        title="SIP Plans"
        sub="Set up automatic recurring gold purchases — daily, weekly, or monthly."
        action={<Btn onClick={() => setModal(true)}>+ New SIP</Btn>}
      />

      <Alert message={success} type="success" onClose={() => setSuccess('')} />

      {loading ? <Spinner /> : sips.length === 0 ? (
        <Card style={{ textAlign: 'center' }}>
          <EmptyState icon="↻" message="No SIP plans yet. Start your first recurring gold investment." />
          <div style={{ marginTop: 16 }}>
            <Btn onClick={() => setModal(true)}>Create SIP Plan</Btn>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {sips.map(sip => (
            <Card key={sip.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 20, color: 'var(--gold)' }}>↻</span>
                    <span style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-display)' }}>{fmt(sip.amountInINR)}</span>
                    <Badge color={sip.isActive ? 'green' : 'gray'}>{sip.isActive ? 'Active' : 'Paused'}</Badge>
                    <Badge color="gold">{sip.frequency}</Badge>
                  </div>
                  <div style={{ display: 'flex', gap: 20, fontSize: 12, color: 'var(--text-2)', flexWrap: 'wrap' }}>
                    <span>Next run: {new Date(sip.nextRunAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    {sip.lastRunAt && <span>Last run: {new Date(sip.lastRunAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>}
                    {sip.frequency === 'WEEKLY' && sip.dayOfWeek != null && <span>Every {DAYS[sip.dayOfWeek]}</span>}
                    {sip.frequency === 'MONTHLY' && sip.dayOfMonth && <span>Day {sip.dayOfMonth} of month</span>}
                  </div>

                  {/* Recent executions */}
                  {sip.executions?.length > 0 && (
                    <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {sip.executions.map(ex => (
                        <Badge key={ex.id} color={ex.status === 'COMPLETED' ? 'green' : 'red'}>
                          {new Date(ex.executedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} · {ex.status}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <Btn variant={sip.isActive ? 'secondary' : 'green'} small onClick={() => handleToggle(sip.id, sip.isActive)}>
                    {sip.isActive ? 'Pause' : 'Resume'}
                  </Btn>
                  <Btn variant="danger" small onClick={() => handleDelete(sip.id)}>Delete</Btn>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => { setModal(false); setError(''); }} title="Create SIP Plan">
        <Alert message={error} type="error" onClose={() => setError('')} />

        <FormGroup label="Amount (INR)">
          <input type="number" min="100" placeholder="₹ 500" value={form.amountInINR} onChange={set('amountInINR')} />
        </FormGroup>

        <FormGroup label="Frequency">
          <select value={form.frequency} onChange={set('frequency')}>
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
            <option value="MONTHLY">Monthly</option>
          </select>
        </FormGroup>

        {form.frequency === 'WEEKLY' && (
          <FormGroup label="Day of week">
            <select value={form.dayOfWeek} onChange={set('dayOfWeek')}>
              {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
            </select>
          </FormGroup>
        )}

        {form.frequency === 'MONTHLY' && (
          <FormGroup label="Day of month">
            <select value={form.dayOfMonth} onChange={set('dayOfMonth')}>
              {Array.from({ length: 28 }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </FormGroup>
        )}

        <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 16 }}>
          Minimum ₹100 · Executes at 9:00 AM IST · Skipped if gold API is unavailable
        </p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Btn variant="ghost" onClick={() => setModal(false)}>Cancel</Btn>
          <Btn onClick={handleCreate} disabled={saving}>{saving ? 'Creating…' : 'Create SIP'}</Btn>
        </div>
      </Modal>
    </div>
  );
}
