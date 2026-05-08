# JP Motorcross — Apparel Store

Premium motocross apparel e-commerce built with TanStack Start, Drizzle ORM, better-auth, and Stripe.

## Stack

- **Framework**: TanStack Start (file-based routing, server functions)
- **Runtime**: Bun
- **Database**: PostgreSQL via Drizzle ORM
- **Auth**: better-auth (Google OAuth only) + `@better-auth/stripe` plugin
- **Payments**: Stripe Checkout Sessions + webhooks
- **Styling**: Tailwind CSS v4

---

## Getting started

### 1. Clone and install

```bash
git clone <repo>
cd jp-motorcross
bun install
```

### 2. Environment variables

```bash
cp .env.example .env
```

Fill in all values — see the sections below for how to get each one.

### 3. Database

```bash
bun run db:push    # push schema to your Postgres instance
bun run db:seed    # create 10 products + Stripe Product/Price records
```

### 4. Run dev server

```bash
bun run dev
```

---

## Environment variable setup

### `DATABASE_URL`

Any PostgreSQL connection string. For local dev, [Neon](https://neon.tech) or a local Postgres instance both work:

```
postgresql://user:password@localhost:5432/jp_motorcross
```

### `BETTER_AUTH_URL`

The base URL of your app. `http://localhost:3000` for local dev, your production domain in production.

### `BETTER_AUTH_SECRET`

A random 32+ character string. Generate one:

```bash
openssl rand -base64 32
```

### `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

1. Go to [Google Cloud Console](https://console.cloud.google.com) → **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Choose **Web application**
4. Add `http://localhost:3000` to **Authorized JavaScript origins**
5. Add `http://localhost:3000/api/auth/callback/google` to **Authorized redirect URIs**
6. Copy the Client ID and Client Secret into your `.env`

In production, add your real domain to both lists.

### `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY`

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Copy the **Secret key** (`sk_test_...`) and **Publishable key** (`pk_test_...`)

### `STRIPE_WEBHOOK_SECRET`

**Local development** — use the Stripe CLI:

```bash
# Install: https://stripe.com/docs/stripe-cli
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

The CLI prints a webhook signing secret (`whsec_...`) — paste that into `STRIPE_WEBHOOK_SECRET`.

**Production** — create a webhook endpoint in the Stripe Dashboard:

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. URL: `https://yourdomain.com/api/stripe/webhook`
4. Events to listen for:
   - `checkout.session.completed`
   - `charge.refunded`
5. Copy the **Signing secret** into your production environment variables

---

## Order fulfillment

**The owner fulfills orders directly from the Stripe Dashboard — there is no admin panel in this app.**

When a customer completes checkout, Stripe Checkout collects their shipping address, phone number, and payment. The webhook marks the order as `paid` in the database and decrements stock.

To fulfill an order:
1. Go to [Stripe Dashboard → Payments](https://dashboard.stripe.com/payments)
2. Click on a payment to see the customer's name, email, shipping address, and the exact line items they purchased (each item includes the size in the description, e.g. "Mud Demon Tee — Size L")
3. Pack and ship the order, then mark it fulfilled in Stripe by adding a note or using Stripe's fulfillment metadata

For refunds, process them directly in the Stripe Dashboard — the webhook will automatically update the order status to `refunded` in the database.

---

## Scripts

| Command | Description |
|---|---|
| `bun run dev` | Start dev server |
| `bun run build` | Production build |
| `bun run start` | Start production server |
| `bun run db:push` | Push schema changes to database |
| `bun run db:generate` | Generate Drizzle migration files |
| `bun run db:migrate` | Run pending migrations |
| `bun run db:studio` | Open Drizzle Studio |
| `bun run db:seed` | Seed 10 products (5 tees + 5 hoodies) |
