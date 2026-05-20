# Migration Guide — v1 → v2

## What changed from your original code

### Files REPLACED (upgraded versions)
| File | What changed |
|---|---|
| `src/server.js` | Added all new routes, rate limiter, cron jobs, global error handler |
| `src/controllers/goldBuyController.js` | Fixed minimum amount bug (₹1→₹10), added sanitisation |
| `src/controllers/goldAdvisorController.js` | Added input sanitisation, prompt injection protection |
| `src/services/goldBuyService.js` | Uses singleton Prisma, fixed double-nested response bug |
| `src/services/goldAdvisorService.js` | Improved prompt, injection-safe |
| `src/routes/goldBuy.js` | Added auth middleware |
| `src/routes/goldAdvisor.js` | Added auth + rate limiter |
| `prisma/schema.prisma` | Full schema: 8 models (User, GoldTransaction, GoldSell, Portfolio, PriceSnapshot, Alert, SIP, Webhook) |
| `package.json` | Added: bcryptjs, jsonwebtoken, express-rate-limit, node-cron, nodemailer, pdfkit |

### Files ADDED (brand new)
| Layer | Files |
|---|---|
| Middleware | `src/middleware/auth.js`, `src/middleware/rateLimiter.js` |
| Lib | `src/lib/prisma.js` (singleton — fixes PrismaClient leak) |
| Utils | `goldPrice.js`, `sanitise.js`, `webhook.js`, `pdfReceipt.js`, `mailer.js` |
| Services | `authService`, `goldSellService`, `portfolioService`, `priceService`, `alertService`, `sipService`, `webhookService` |
| Controllers | 8 new controllers (auth, sell, portfolio, price, alert, sip, webhook, receipt) |
| Routes | 8 new route files |
| Cron | `priceSnapshotJob.js`, `alertJob.js`, `sipJob.js` |

---

## Steps to run after cloning

```bash
# 1. Install dependencies (new ones added)
npm install

# 2. Copy env and fill in your keys
cp .env.example .env

# 3. Run DB migration (schema changed — new tables added)
npx prisma migrate dev --name v2-full-schema

# 4. Start dev server
npm run dev
```

## New .env keys needed (vs original)
```env
# These were already in your .env.sample:
DATABASE_URL=...
GEMINI_API_KEY=...
METALS_API_KEY=...

# These are NEW — add them:
JWT_SECRET="any_random_32_char_string"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_gmail_app_password"
APP_URL="http://localhost:3002"
NODE_ENV="development"
```

## New API endpoints
| Method | Endpoint | Auth? |
|---|---|---|
| POST | `/api/auth/register` | No |
| POST | `/api/auth/login` | No |
| POST | `/api/gold-purchase` | ✅ JWT |
| POST | `/api/gold-sell` | ✅ JWT |
| GET | `/api/portfolio` | ✅ JWT |
| GET | `/api/price/live` | ✅ JWT |
| GET | `/api/price/history?days=30` | ✅ JWT |
| GET/POST/DELETE | `/api/alerts` | ✅ JWT |
| GET/POST/PATCH/DELETE | `/api/sip` | ✅ JWT |
| GET/POST/DELETE | `/api/webhooks` | ✅ JWT |
| GET | `/api/receipts/:txId` | ✅ JWT |
| POST | `/api/gold-advisor` | ✅ JWT |
