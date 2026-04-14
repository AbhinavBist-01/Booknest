# Book My Ticket - Backend Hackathon Submission

Production-style backend extension built on top of the provided starter codebase from Chai Aur SQL.

This project adds authentication, protected booking flow, user-linked bookings, and legacy endpoint compatibility while keeping the starter behavior intact.

## Starter Reference

- Starter repository: `https://github.com/chaicodehq/book-my-ticket`
- Track: **Backend Ninja**
- Focus: extend existing codebase, do not break existing endpoints

## Features Implemented

- User registration (`/auth/signup`)
- User login (`/auth/login`)
- JWT-based access token authentication
- Refresh token support (`/auth/refresh`) + logout (`/auth/logout`)
- Protected routes via auth middleware
- Logged-in users can create/view/cancel only their own bookings
- Movie show booking with seat availability checks
- Seat count decrement on booking and increment on cancellation
- Legacy compatibility endpoints preserved (`/seats`, `PUT /:id/:name`)
- Optional multi-page frontend demo (`/ui/signup`, `/ui/login`, `/ui/booking`)

## Tech Stack

- Node.js + Express
- TypeScript
- PostgreSQL
- Drizzle ORM + Drizzle Kit
- Zod
- bcryptjs
- jsonwebtoken
- cookie-parser

## Project Structure

```txt
src/
  app/
    auth/
      controller.ts
      model.ts
      routes.ts
      middlewares/middleware.ts
      utils/token.ts
    booking/
      booking.controller.ts
      booking.model.ts
      booking.route.ts
    legacy/
      legacy.route.ts
    frontend/
      signup.html
      login.html
      booking.html
      shared.js
      styles.css
    index.ts
  db/
    index.ts
    schema.ts
```

## Database Schema

Core tables:

- `users`
- `movies`
- `shows`
- `bookings`

Legacy compatibility table:

- `seats`

## Environment Variables

Create `.env` in root:

```env
PORT=4000
DATABASE_URL=postgres://postgres:postgres@localhost:5434/projectdb
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
```

## Setup and Run

### 1) Install dependencies

```bash
pnpm install
```

### 2) Start PostgreSQL

```bash
docker compose up -d
```

> Local development uses Docker PostgreSQL. Deployment on Vercel must use a hosted/cloud PostgreSQL URL.

### 3) Apply schema

Use migration flow:

```bash
pnpm db:generate
pnpm db:migrate
```

or push flow:

```bash
pnpm drizzle-kit push --config=drizzle-config.js
```

### 4) Build and start

```bash
pnpm build
pnpm start
```

Server: `http://localhost:4000`

## Deployment (Vercel)

This project is configured for Vercel serverless deployment with:

- `api/index.ts`
- `vercel.json`

### Deploy Order

1. Push code to GitHub
2. Import repository in Vercel
3. Set project root directory to `Booknest` (if needed)
4. Add environment variables in Vercel:
   - `DATABASE_URL` (cloud Postgres)
   - `JWT_ACCESS_SECRET`
   - `JWT_REFRESH_SECRET`
5. Deploy

### Important

- `localhost`/Docker DB URLs do **not** work on Vercel.
- Use a hosted database provider (Neon, Supabase, Railway, etc.).
- If Supabase shows "Not IPv4 compatible", do not use the direct `db.<project-ref>.supabase.co` URL on Vercel.
- Use Supabase Session Pooler connection string for deployment.
- After setting cloud `DATABASE_URL`, run schema sync once against that DB:

```bash
pnpm drizzle-kit push --config=drizzle-config.js
```

### Supabase Session Pooler Example

Use the Session Pooler values from Supabase dashboard and set `DATABASE_URL` in Vercel:

```env
DATABASE_URL=postgresql://postgres.<project-ref>:[YOUR-PASSWORD]@aws-<region>.pooler.supabase.com:5432/postgres?sslmode=require
```

Notes:

- Use the exact host/user from your Session Pooler panel.
- Keep `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` set in Vercel.

## API Endpoints

### Auth

- `POST /auth/signup`
- `POST /auth/login`
- `GET /auth/me` (protected)
- `POST /auth/refresh`
- `POST /auth/logout`

### Booking (Protected)

- `POST /bookings` -> create booking
- `GET /bookings/my` -> current user's bookings
- `DELETE /bookings/:id` -> cancel own booking

### Legacy Compatibility

- `GET /seats`
- `PUT /:id/:name` (protected in this implementation)

## Sample Requests

### Signup

`POST /auth/signup`

```json
{
  "first_name": "Abhinav",
  "last_name": "Bist",
  "email": "abhinav@mail.com",
  "password": "password123"
}
```

### Login

`POST /auth/login`

```json
{
  "email": "abhinav@mail.com",
  "password": "password123"
}
```

### Create Booking

`POST /bookings`

Headers:

```txt
Authorization: Bearer <accessToken>
```

Body:

```json
{
  "showId": "e9b82d67-7af0-4827-bde8-5b10f2f37cf0",
  "seats": 2
}
```

## Legacy Seats Seed (if needed)

```sql
CREATE TABLE IF NOT EXISTS seats (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  isbooked INT DEFAULT 0
);

INSERT INTO seats (isbooked)
SELECT 0
FROM generate_series(1, 20)
WHERE NOT EXISTS (SELECT 1 FROM seats);
```

## Frontend Demo (Optional)

Available pages:

- `/ui`
- `/ui/signup.html`
- `/ui/login.html`
- `/ui/booking.html`

Flow:

1. Signup/Login
2. Access token stored client-side
3. Book seats and manage bookings via protected APIs

## Booking Safety Notes

- Booking routes are protected via JWT middleware.
- User identity is derived from token (`res.locals.id`), not from request body.
- Seat availability is checked before booking.
- On cancel, seats are restored.
- Legacy seat booking uses transaction + `FOR UPDATE` lock to prevent duplicate claims.

## Submission Note

This implementation extends the starter architecture with authentication and protected booking APIs while preserving legacy behavior for compatibility.
