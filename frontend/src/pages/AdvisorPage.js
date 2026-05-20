import React, { useState, useRef, useEffect } from 'react';
import { askAdvisor } from '../utils/api';
import { PageHeader, Card, Btn } from '../components/UI';

const SUGGESTIONS = [
  'Is now a good time to buy gold?',
  'How should I allocate gold in my portfolio?',
  'What is the difference between Digital Gold and Sovereign Gold Bonds?',
  'How do Gold ETFs compare to physical gold?',
  'What percentage of my savings should be in gold?',
];

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div style={{
      display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: 16, gap: 10, alignItems: 'flex-start',
    }}>
      {!isUser && (
        <div style={{
          width: 32, height: 32, borderRadius: 8, background: 'var(--gold-muted)',
          border: '1px solid var(--gold-border)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 14, color: 'var(--gold)', flexShrink: 0,
        }}>
          ✦
        </div>
      )}
      <div style={{
        maxWidth: '75%',
        background: isUser ? 'var(--gold-muted)' : 'var(--bg-3)',
        border: `1px solid ${isUser ? 'var(--gold-border)' : 'var(--border)'}`,
        borderRadius: isUser ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
        padding: '12px 16px',
        fontSize: 14,
        lineHeight: 1.7,
        color: isUser ? 'var(--gold-light)' : 'var(--text)',
        whiteSpace: 'pre-wrap',
      }}>
        {msg.content}
      </div>
    </div>
  );
}

export default function AdvisorPage() {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: "Hello! I'm Kuberi's AI gold advisor powered by Gemini. Ask me anything about gold investment — prices, strategies, SGB vs ETF, portfolio allocation, or anything else.",
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (question) => {
    const q = question || input.trim();
    if (!q || loading) return;

    setInput('');
    setMessages(m => [...m, { role: 'user', content: q }]);
    setLoading(true);

    try {
      // 1. Instantly open an empty bubble for the assistant to fill up
      setMessages(m => [...m, { role: 'assistant', content: '' }]);

      // 2. Consume the text chunks over the native fetch pipe
      await askAdvisor(q, (chunkText) => {
        setLoading(false); // Disable pulsing loader once data streams down
        
        setMessages(m => {
          const updated = [...m];
          const lastIdx = updated.length - 1;
          updated[lastIdx] = {
            ...updated[lastIdx],
            content: updated[lastIdx].content + chunkText
          };
          return updated;
        });
      });

    } catch (err) {
      console.error(err);
      setMessages(m => [
        ...m.slice(0, -1), // Strip the incomplete streaming layout bubble away
        { role: 'assistant', content: 'Something went wrong. Please try again in a moment.' }
      ]);
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
      <PageHeader
        title="AI Gold Advisor ✦"
        sub="Powered by Gemini 2.5 Flash · Expert gold investment guidance"
      />

      <Card style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}

          {loading && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--gold-muted)', border: '1px solid var(--gold-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'var(--gold)' }}>✦</div>
              <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: '12px 12px 12px 4px', padding: '14px 18px', display: 'flex', gap: 6, alignItems: 'center' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)',
                    animation: `bounce 1.2s ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div style={{ padding: '0 20px 12px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {SUGGESTIONS.slice(0, 3).map((s) => (
              <button key={s} onClick={() => send(s)} style={{
                padding: '6px 12px', borderRadius: 20,
                background: 'var(--bg-3)', border: '1px solid var(--border)',
                color: 'var(--text-2)', fontSize: 12, cursor: 'pointer',
                fontFamily: 'var(--font-body)', transition: 'all 0.15s',
              }}
                onMouseOver={e => { e.target.style.borderColor = 'var(--gold-border)'; e.target.style.color = 'var(--gold)'; }}
                onMouseOut={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-2)'; }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{ padding: '12px 20px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
          <input
            type="text"
            placeholder="Ask about gold prices, investment strategies, SGB, ETFs…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            disabled={loading}
            style={{ flex: 1 }}
          />
          <Btn onClick={() => send()} disabled={!input.trim() || loading} style={{ flexShrink: 0 }}>
            {loading ? '…' : '→'}
          </Btn>
        </div>
      </Card>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}