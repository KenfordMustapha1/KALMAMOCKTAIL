# KALMA MIXTAIL

Premium online drink ordering platform for **Dirty Sodas**, **Mocktails**, and **Cocktails**.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js (Create React App), Tailwind CSS, React Router |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Auth | JWT + bcrypt |
| Deploy | Vercel (client) · Render (API) |

## Project Structure

```
kalma-mixtail/
├── client/          # React frontend
└── backend/         # Express API
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your MongoDB Atlas connection string and JWT secret:

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/kalma-mixtail
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:3000
PORT=5000
```

Seed the database with sample drinks and an admin user:

```bash
npm run seed
```

Start the API:

```bash
npm run dev
```

### 2. Frontend Setup

```bash
cd client
npm install
cp .env.example .env
```

Set the API URL in `.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start the app:

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000).

### Default Admin Credentials (after seed)

| Field | Value |
|-------|-------|
| Email | admin@kalmamixtail.com |
| Password | admin123 |

> Change the admin password after first login in production.

## API Endpoints

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/profile` | Auth |
| GET | `/api/drinks` | Public |
| POST | `/api/drinks` | Admin |
| POST | `/api/orders` | Auth |
| GET | `/api/orders/myorders` | Auth |
| GET | `/api/orders` | Admin |
| PUT | `/api/orders/:id/status` | Admin |
| GET | `/api/analytics` | Admin |
| GET | `/api/users/customers` | Admin |

## Deployment

### Backend — Render

1. Push the repo to GitHub.
2. Create a **Web Service** on [Render](https://render.com).
3. Set **Root Directory** to `backend`.
4. **Build Command:** `npm install`
5. **Start Command:** `npm start`
6. Add environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `JWT_EXPIRE=7d`
   - `CLIENT_URL` (your Vercel URL)
   - `NODE_ENV=production`
7. Run seed once from your machine pointing at production DB, or use Render shell: `npm run seed`

### Frontend — Vercel

1. Import the repo on [Vercel](https://vercel.com).
2. Set **Root Directory** to `client`.
3. **Framework Preset:** Create React App
4. Add environment variable:
   - `REACT_APP_API_URL=https://your-render-app.onrender.com/api`
5. Deploy.

`vercel.json` is included for SPA routing.

## Features

- Landing page with hero and featured drinks
- Category filtering (Dirty Soda, Mocktail, Cocktail)
- Shopping cart with localStorage persistence
- JWT authentication with protected routes
- Order placement and order history
- Admin dashboard: orders, drinks CRUD, customers, analytics
- Dark premium UI with Tailwind CSS

## License

MIT © KALMA MIXTAIL
# KALMAMOCKTAIL
