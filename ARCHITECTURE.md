# PulseLayer Architecture & Algorithmic Specification

This document details the architectural design, data pipelines, scoring mathematics, database schemas, and streaming mechanics of **PulseLayer**.

---

## 1. High-Level Architectural Pipeline

```
  ┌─────────────────────────────────────────────────────────────┐
  │                 Stellar Horizon Mainnet                      │
  └──────────────────────────────┬──────────────────────────────┘
                                 │ SSE (Server-Sent Events)
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │         PulseLayer Ingestion Indexer (server/indexer.ts)     │
  └──────────────────────────────┬──────────────────────────────┘
                                 │ Parse Ops & Txs
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │       Deterministic Risk Engine (server/scoring.ts)         │
  └──────────────┬──────────────────────────────┬───────────────┘
                 │ Write Record                 │ Broadcast Event
                 ▼                              ▼
  ┌─────────────────────────────┐  ┌────────────────────────────┐
  │ SQLite DB (data/pulselayer) │  │  WebSocket Stream (/ws)   │
  └──────────────┬──────────────┘  └────────────┬───────────────┘
                 │ Read State                   │ Socket Messages
                 ▼                              ▼
  ┌─────────────────────────────────────────────────────────────┐
  │             Next.js 16 UI Dashboard (App Router)            │
  └─────────────────────────────────────────────────────────────┘
```

---

## 2. Deterministic Scoring Algorithm Details

The **Pulse Score** \( S \in [0, 100] \) assesses account trust based on five core operational signals.

### 2.1 Score Formulation

\[
S = \text{clamp}\left( w_1 F_1 + w_2 F_2 + w_3 F_3 + w_4 F_4 + w_5 F_5 - \Delta_{\text{anomaly}}, \, 0, \, 100 \right)
\]

#### Weight Allocations (\( \sum w_i = 1.0 \)):
* **\( w_1 = 0.25 \)** — Account Lifespan Maturity (\( F_1 \))
* **\( w_2 = 0.25 \)** — Transaction Volume & Operational Density (\( F_2 \))
* **\( w_3 = 0.20 \)** — XLM Balance Reserve Buffer (\( F_3 \))
* **\( w_4 = 0.15 \)** — Asset Trustline Connections (\( F_4 \))
* **\( w_5 = 0.15 \)** — Operation Success Rate Ratio (\( F_5 \))

---

### 2.2 Sub-Factor Equations

#### 1. Lifespan Factor (\( F_1 \))
Lifespan is computed using logarithmic saturation up to 365 days:
\[
F_1(d) = \min\left( 100, \, \frac{\ln(1 + d)}{\ln(366)} \times 100 \right)
\]
Where \( d \) is the account lifespan in days.

#### 2. Operational Volume Factor (\( F_2 \))
Transaction activity scales monotonically up to 1,000 transactions:
\[
F_2(N_{\text{tx}}) = \min\left( 100, \, \frac{\sqrt{N_{\text{tx}}}}{\sqrt{1000}} \times 100 \right)
\]

#### 3. XLM Liquidity Buffer (\( F_3 \))
Calculates reserve backing up to 10,000 XLM:
\[
F_3(B) = \min\left( 100, \, \frac{\log_{10}(1 + B)}{\log_{10}(10001)} \times 100 \right)
\]

#### 4. Asset Trustlines Factor (\( F_4 \))
Evaluates diversification across Stellar custom assets:
\[
F_4(T) = \min\left( 100, \, T \times 20 \right)
\]

#### 5. Operation Success Ratio (\( F_5 \))
\[
F_5(R_{\text{success}}) = R_{\text{success}} \times 100
\]

#### 6. Anomaly Penalty (\( \Delta_{\text{anomaly}} \))
If a burst transaction velocity exceeds historical baselines (e.g. > 50 operations per minute without established age), an anomaly flag is assigned:
\[
\Delta_{\text{anomaly}} = \begin{cases} 
35 & \text{if anomaly flag is active} \\ 
0 & \text{otherwise} 
\end{cases}
\]

---

## 3. Database Schema (`pulselayer.db`)

The storage layer uses SQLite with indexing on query-intensive keys:

```sql
CREATE TABLE IF NOT EXISTS accounts (
  account_id TEXT PRIMARY KEY,
  score INTEGER NOT NULL DEFAULT 50,
  trend TEXT NOT NULL DEFAULT 'stable',
  confidence REAL NOT NULL DEFAULT 0.85,
  anomaly_flag INTEGER NOT NULL DEFAULT 0,
  risk_level TEXT NOT NULL DEFAULT 'MODERATE',
  lifespan_days INTEGER NOT NULL DEFAULT 1,
  tx_count INTEGER NOT NULL DEFAULT 0,
  active_days INTEGER NOT NULL DEFAULT 1,
  success_rate REAL NOT NULL DEFAULT 1.0,
  xlm_balance REAL NOT NULL DEFAULT 0.0,
  trustlines_count INTEGER NOT NULL DEFAULT 0,
  funder TEXT,
  created_at TEXT NOT NULL,
  last_updated TEXT NOT NULL,
  breakdown_json TEXT NOT NULL,
  signals_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  hash TEXT NOT NULL,
  type TEXT NOT NULL,
  amount TEXT,
  asset TEXT,
  counterparty TEXT,
  successful INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  is_anomaly INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY(account_id) REFERENCES accounts(account_id)
);

CREATE TABLE IF NOT EXISTS score_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  timestamp TEXT NOT NULL,
  FOREIGN KEY(account_id) REFERENCES accounts(account_id)
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_accounts_score ON accounts(score DESC);
CREATE INDEX IF NOT EXISTS idx_accounts_risk ON accounts(risk_level);
CREATE INDEX IF NOT EXISTS idx_tx_account ON transactions(account_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_snapshots_account ON score_snapshots(account_id, timestamp ASC);
```

---

## 4. Streaming & WebSocket Protocol

* **Transport**: WebSockets (`ws` protocol) attached to Express `http.Server`.
* **Path**: `/ws`
* **Health Check**: Ping/pong heartbeat frames every 30 seconds.
* **Fallback**: When WebSockets disconnect, the client automatically falls back to 10-second REST polling against `/api/stats` and `/api/feed`.
