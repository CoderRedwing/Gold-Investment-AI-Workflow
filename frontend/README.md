# Kuberi Gold — Frontend

React dashboard for the Kuberi Gold investment platform.

## Stack

- React 18 + React Router v6
- Recharts (price chart, portfolio pie)
- Axios with JWT interceptor
- Proxied to backend at `http://localhost:3002`

## Pages

| Route | Page | Features |
|---|---|---|
| `/login` | Auth | Register / Login with JWT |
| `/dashboard` | Dashboard | Portfolio summary, live price, recent trades, quick actions |
| `/trade` | Trade | Buy/Sell with preset amounts, live preview |
| `/portfolio` | Portfolio | Full transaction history, P&L, pie chart |
| `/price` | Price Chart | 7D/30D/90D gold price history via Recharts |
| `/sip` | SIP Plans | Create/pause/delete recurring investments |
| `/alerts` | Price Alerts | Set ABOVE/BELOW target alerts |
| `/advisor` | AI Advisor | Gemini-powered gold investment chatbot |
| `/webhooks` | Webhooks | Register event webhooks with HMAC secrets |

## Setup

```bash
cd frontend
npm install
npm start      # starts on http://localhost:3000
```

Backend must be running on port 3002 (or update the proxy in package.json).

## Design

- **Theme**: Luxury dark gold — deep blacks, warm gold accents
- **Fonts**: Syne (display/headings) + DM Sans (body)
- **Components**: All in `src/components/UI.js` — Card, Btn, Modal, Badge, MetricCard, Spinner, Alert, etc.
