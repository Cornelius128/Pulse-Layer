# PulseLayer Deployment Guide 🚀

This guide explains how to deploy the entire PulseLayer application (**Next.js UI**, **Express REST API**, **WebSocket Live Stream**, and **Stellar Horizon Indexer with SQLite**) on **Render**, **Railway**, or a **Hybrid Setup (Vercel + Render/Railway)**.

---

## Option 1: Deploy Everything on Render (Recommended Blueprint)

Render supports multi-service deployments via **Blueprints** (`render.yaml`).

### Step-by-Step Render Setup:
1. Push your repository to GitHub or GitLab.
2. Log into [Render Dashboard](https://dashboard.render.com/) and click **New +** -> **Blueprint**.
3. Connect your repository. Render will automatically read `render.yaml` and discover two services:
   * **`pulselayer-server`**: Express REST API + WebSocket Server + Horizon Indexer (with a 1GB persistent disk at `/var/data` for SQLite).
   * **`pulselayer-ui`**: Next.js 16 Web Dashboard.
4. Click **Apply**.
5. Once `pulselayer-server` is deployed, Render generates a public URL (e.g. `https://pulselayer-server.onrender.com`).
6. Ensure `pulselayer-ui` environment variables point to your server URL:
   * `NEXT_PUBLIC_API_URL`: `https://pulselayer-server.onrender.com`
   * `NEXT_PUBLIC_WS_URL`: `wss://pulselayer-server.onrender.com/ws`

---

## Option 2: Deploy Everything on Railway

Railway allows quick one-click containerized deployments.

### Step 1: Deploy Backend Server (`server`)
1. Go to [Railway Dashboard](https://railway.app/) and create a **New Project**.
2. Select **Deploy from GitHub repo** and pick your repository.
3. In service settings, set:
   * **Start Command**: `npm run dev:server`
   * **Networking**: Expose Port `5001` or set `PORT=5001`.
   * **Persistent Volume**: Add a Volume mounted at `/app/data` (set `DATA_DIR=/app/data`).
4. Generate a domain (e.g. `https://pulselayer-backend.up.railway.app`).

### Step 2: Deploy Frontend UI (`src`)
1. In the same Railway project, click **New Service** -> **GitHub Repo**.
2. Set:
   * **Start Command**: `npm run build && npm run start`
   * **Variables**:
     * `NEXT_PUBLIC_API_URL`: `https://pulselayer-backend.up.railway.app`
     * `NEXT_PUBLIC_WS_URL`: `wss://pulselayer-backend.up.railway.app/ws`
3. Generate a public domain for the frontend.

---

## Option 3: Hybrid Deployment (Vercel + Render / Railway)

For maximum performance, you can deploy the Next.js UI to **Vercel** and the server/indexer process to **Render** or **Railway**.

1. **Deploy Server**: Deploy the Express + WebSocket + Indexer backend to Render or Railway (as shown in Option 1 or 2).
2. **Deploy UI to Vercel**:
   * Import the repository in [Vercel](https://vercel.com).
   * Add Environment Variables in Vercel project settings:
     * `NEXT_PUBLIC_API_URL` = `https://your-backend-server.onrender.com`
     * `NEXT_PUBLIC_WS_URL` = `wss://your-backend-server.onrender.com/ws`
   * Click **Deploy**.

---

## Option 4: Local or VPS Docker Deployment

Deploy with Docker Compose on any server:

```bash
# Clone repository
git clone https://github.com/your-org/pulse-layer.git
cd pulse-layer

# Launch services
docker-compose up -d --build
```

Access:
* UI: `http://localhost:3000`
* REST API: `http://localhost:5001/api/stats`
* WebSocket: `ws://localhost:5001/ws`

---

## Environment Variables Reference

| Variable | Description | Default / Example |
|---|---|---|
| `PORT` | Backend server port | `5001` |
| `HOST` | Backend server host binding | `0.0.0.0` |
| `CORS_ORIGIN` | Allowed HTTP origin | `*` or `https://your-ui-domain.com` |
| `DATA_DIR` | Directory for SQLite DB storage | `./data` or `/var/data` |
| `NEXT_PUBLIC_API_URL` | Frontend API backend target | `http://localhost:5001` |
| `NEXT_PUBLIC_WS_URL` | Frontend WebSocket stream target | `ws://localhost:5001/ws` |
