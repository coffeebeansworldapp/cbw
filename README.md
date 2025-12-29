Coffee Beans World — React + Node + MongoDB scaffold
=================================================

This scaffold prepares your current static site to a React frontend and a Node.js (Express) backend using MongoDB for data and a Clouderia service stub for image/video uploads.

Structure created:

- `frontend/` — Vite + React app (pages & carousel)
- `backend/` — Express API, MongoDB connection, media upload route
- `images/` — place your existing leaf images here (served statically)

Quick start (development):

1. Backend

```bash
cd "coffee-beans-world/backend"
cp .env.example .env
# fill in MONGO_URI and CLOUDERIA values in .env
npm install
npm run dev
```

2. Frontend

```bash
cd "coffee-beans-world/frontend"
npm install
npm run dev
```

Notes:
- The backend serves `images/` at `/images` so the frontend can reference `/images/leaf-1.png` etc.
- `backend/services/clouderia.js` contains a placeholder upload function — replace with your Clouderia API details.
