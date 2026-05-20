import React, { useState, useEffect } from 'react';
import { getWebhooks, createWebhook, deleteWebhook } from '../utils/api';
import { PageHeader, Card, Btn, Modal, FormGroup, EmptyState, Spinner, Badge, Alert } from '../components/UI';

const EVENTS = ['gold.purchased', 'gold.sold', 'sip.executed', 'alert.triggered'];

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ url: '', events: [] });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const load = () => getWebhooks().then(r => setWebhooks(r.data)).catch(console.error).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const toggleEvent = (ev) => {
    setForm(f => ({
      ...f,
      events: f.events.includes(ev) ? f.events.filter(e => e !== ev) : [...f.events, ev],
    }));
  };

  const handleCreate = async () => {
    if (!form.url) { setError('Webhook URL required'); return; }
    if (!form.url.startsWith('https://')) { setError('URL must start with https://'); return; }
    if (!form.events.length) { setError('Select at least one event'); return; }
    setSaving(true); setError('');
    try {
      await createWebhook({ url: form.url, events: form.events });
      setModal(false); setForm({ url: '', events: [] }); load();
    } catch (err) { setError(err.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete webhook?')) return;
    await deleteWebhook(id).catch(console.error); load();
  };

  const copyUrl = (url, id) => {
    navigator.clipboard.writeText(url).then(() => { setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); });
  };

  return (
    <div>
      <PageHeader
        title="Webhooks"
        sub="Receive HTTP POST notifications when events happen in your account."
        action={<Btn onClick={() => setModal(true)}>+ Add Webhook</Btn>}
      />

      {/* Info box */}
      <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px 18px', marginBottom: 24, fontSize: 13, color: 'var(--text-2)' }}>
        <strong style={{ color: 'var(--text)', display: 'block', marginBottom: 4 }}>How webhooks work</strong>
        When a subscribed event fires (e.g. gold purchased), we POST a signed JSON payload to your URL.
        Verify the <code style={{ background: 'var(--bg-3)', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>X-Kuberi-Signature</code> header using your webhook secret.
      </div>

      {loading ? <Spinner /> : webhooks.length === 0 ? (
        <Card style={{ textAlign: 'center' }}>
          <EmptyState icon="⊕" message="No webhooks yet. Connect your apps to gold events." />
          <div style={{ marginTop: 16 }}><Btn onClick={() => setModal(true)}>Add Webhook</Btn></div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {webhooks.map(wh => (
            <Card key={wh.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                    <Badge color={wh.isActive ? 'green' : 'gray'}>{wh.isActive ? 'Active' : 'Inactive'}</Badge>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {wh.events.map(ev => (
                        <Badge key={ev} color="gold">{ev}</Badge>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <code style={{ fontSize: 13, color: 'var(--text-2)', background: 'var(--bg-3)', padding: '4px 10px', borderRadius: 6, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {wh.url}
                    </code>
                    <button onClick={() => copyUrl(wh.url, wh.id)} style={{
                      padding: '4px 8px', background: 'var(--bg-3)', border: '1px solid var(--border)',
                      borderRadius: 6, fontSize: 12, color: copiedId === wh.id ? 'var(--green)' : 'var(--text-2)',
                      cursor: 'pointer', flexShrink: 0, fontFamily: 'var(--font-body)',
                    }}>
                      {copiedId === wh.id ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
                    Secret: <code style={{ color: 'var(--text-2)' }}>***hidden***</code>
                    · Created {new Date(wh.createdAt).toLocaleDateString('en-IN')}
                  </div>
                </div>
                <Btn variant="danger" small onClick={() => handleDelete(wh.id)}>Delete</Btn>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => { setModal(false); setError(''); }} title="Add Webhook">
        <Alert message={error} type="error" onClose={() => setError('')} />

        <FormGroup label="Endpoint URL">
          <input type="url" placeholder="https://your-app.com/webhook" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
        </FormGroup>

        <FormGroup label="Subscribe to events">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {EVENTS.map(ev => (
              <label key={ev} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14 }}>
                <input type="checkbox" checked={form.events.includes(ev)} onChange={() => toggleEvent(ev)}
                  style={{ width: 16, height: 16, accentColor: 'var(--gold)', cursor: 'pointer' }} />
                <code style={{ fontSize: 13, color: 'var(--text-2)', background: 'var(--bg-3)', padding: '2px 8px', borderRadius: 4 }}>{ev}</code>
              </label>
            ))}
          </div>
        </FormGroup>

        <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 16 }}>
          A secret key will be generated. Use it to verify incoming webhook signatures.
        </p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Btn variant="ghost" onClick={() => setModal(false)}>Cancel</Btn>
          <Btn onClick={handleCreate} disabled={saving}>{saving ? 'Saving…' : 'Add Webhook'}</Btn>
        </div>
      </Modal>
    </div>
  );
}
