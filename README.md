# AquaFlow — AI Water Refilling Station Platform

A management platform for water refilling stations covering the full operation:
ordering, delivery, inventory, machines, staff, and finances — with AI woven
through every module (demand forecasting, reorder prediction, route
optimization, maintenance prediction, quality anomaly detection, fraud
screening, dynamic pricing, and a support chatbot).

Built with **Next.js 16 + TypeScript + Tailwind CSS v4 + shadcn/ui**, charts by
Recharts. The app currently runs on a deterministic **demo dataset**
(`lib/data/*`) so every screen is fully explorable without any keys or
accounts. A production-ready **Supabase schema** is included in
`supabase/schema.sql`.

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Modules

| Area | Route | Covers |
| --- | --- | --- |
| Executive Dashboard | `/` | Revenue, deliveries, inventory, machine health, water quality, satisfaction, AI recommendations |
| Orders | `/orders`, `/orders/new` | 4 water types, 5 container sizes, delivery/pickup, scheduling, express, repeat order, online payment / COD |
| Customers | `/customers`, `/customers/[id]` | Registration, profiles, addresses, order history, favorites, loyalty points, QR customer ID |
| Subscriptions | `/subscriptions` | Weekly / biweekly / monthly plans, automatic delivery scheduling |
| AI Reorder Prediction | `/predictions` | Learns per-customer patterns, sends "reorder your usual?" messages |
| Demand Forecasting | `/forecasting` | Weather / holidays / season / past sales / events → monthly forecast |
| Inventory | `/inventory` | Water stock, containers, caps, labels, filters, chemicals; AI runway ("lasts 13 days → order 300") |
| Suppliers | `/suppliers` | AI scoring on price, quality, delivery speed |
| Deliveries | `/deliveries` | Route optimization, AI driver assignment, live ETA, GPS tracking |
| Maintenance | `/maintenance` | RO / UV / pump / filter failure prediction before breakdown |
| Water Quality | `/quality` | TDS, pH, temperature, turbidity, pressure, flow — anomaly + leak detection |
| Fraud Detection | `/fraud` | Fake refunds, duplicate deliveries, inventory mismatches, suspicious discounts |
| Sales & Insights | `/sales` | Daily/weekly/monthly sales, top products/customers, plain-language AI insights |
| Finance & Pricing | `/finance` | Income/expense/cash-flow forecast, AI dynamic pricing |
| Promotions & Sentiment | `/promotions` | Win-back offers for inactive customers, sentiment across reviews/chat/FB/SMS |
| Employees | `/employees` | Roster, attendance, payroll, AI performance scoring |
| AI Assistant | `/assistant` | Customer chatbot, voice ordering, staff voice commands |
| Invoice OCR | `/invoices` | Receipt upload → invoice number, date, amount, items |
| Energy | `/energy` | Pump electricity, machine runtime, AI savings suggestions |

## Going to production

The demo layer is intentionally shaped like the database. To wire up real data:

1. **Supabase** — create a project, run `supabase/schema.sql` in the SQL
   editor. It creates all tables, enums, and Row Level Security policies
   (customers see only their own rows; staff access is gated by the
   `employees` table). Then:

   ```bash
   npm install @supabase/supabase-js @supabase/ssr
   ```

   ```bash
   # .env.local
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...   # server-only, for Edge Functions / jobs
   ```

   Replace the imports from `lib/data/*` with Supabase queries — the field
   names match the schema.

2. **AI (OpenAI)** — the chatbot, business insights, invoice OCR, and voice
   parsing are designed to run as Supabase Edge Functions calling GPT (and
   Whisper for voice). Forecasting and reorder prediction run fine as nightly
   scheduled functions over `orders` / `sensor_readings`.

3. **Maps & delivery** — set `GOOGLE_MAPS_API_KEY` for route optimization
   (Routes API), live tracking, and ETAs. `driver_locations` +
   `delivery_stops` already store GPS coordinates; Supabase Realtime pushes
   position updates to the tracking screen.

4. **Payments** — Stripe / PayPal for cards, GCash & Maya via their checkout
   APIs (or an aggregator like PayMongo, which covers both). Store the
   gateway reference in `orders.payment_ref`.

5. **Automation (n8n)** — webhooks from the app trigger n8n flows for SMS,
   email, push, and WhatsApp: reorder reminders, delivery ETAs, promo
   campaigns, and alert escalation.

## Notes

- Demo dates are anchored to a fixed timestamp (`lib/data/core.ts`) so charts
  render identically on server and client. Delete the anchor once real data
  flows in.
- Currency is formatted as Philippine pesos throughout (`peso` /
  `pesoExact` in `lib/data/core.ts`).
# water_refilling
