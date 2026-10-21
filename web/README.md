# Decor 41 — E-commerce website

Next.js storefront + admin panel matching the approved HTML prototype and service agreement.

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Prisma** + **PostgreSQL** (Neon in production)
- **Razorpay** (UPI / Cards — no COD)
- Deploy target: **Vercel** (or any Node host)

## Quick start

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

- Store: http://localhost:3000  
- Admin: http://localhost:3000/admin  

### Default admin

| Field    | Value              |
|----------|--------------------|
| Email    | `admin@decor41.com` |
| Password | `Decor41@Admin`     |

Change these in `.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`) and re-run `npm run db:seed`.

## Environment

Copy `.env.example` → `.env`:

- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `NEXT_PUBLIC_RAZORPAY_KEY_ID` — leave empty for **demo checkout** (orders marked Paid without gateway)
- Contact / WhatsApp defaults use **86677 06941** from the agreement

## Features

**Storefront** — home, categories, PDP, search, cart, coupons (`DECOR10`, `FREESHIP`), checkout, order confirmation, dark/light theme, custom laser-cut form with file upload.

**Admin** — dashboard, sales (status + CSV), leads (incl. uploaded files), products CRUD, editable shipping & contact settings.

## Scripts

| Command           | Purpose                |
|-------------------|------------------------|
| `npm run dev`     | Local development      |
| `npm run build`   | Production build       |
| `npm run db:seed` | Seed sample catalog    |
| `npm run db:reset`| Reset DB + reseed      |
