# Security Policy & Operational Safety

## Core Security Philosophy

PulseLayer is designed as a **non-custodial, read-only analytics protocol** for the Stellar Network. It analyzes publicly available ledger data emitted by Stellar Horizon nodes to calculate deterministic trust metrics.

### Non-Custodial Guarantee
- **Zero Key Access**: PulseLayer does **not** collect, process, request, store, or transmit private keys, secret seeds (`S...`), or signing credentials.
- **Public Data Only**: All calculations rely exclusively on public key addresses (`G...`), transaction hashes, ledger sequence numbers, and public operation payloads.

---

## Supported Versions

Security updates are actively applied to the following software versions:

| Version | Supported | Notes |
|---|---|---|
| 1.0.x | Yes | Main active version |
| < 1.0.0 | No | Legacy preview builds |

---

## Threat Model & Security Controls

### 1. SQL Injection Prevention
PulseLayer uses `better-sqlite3` with **strict prepared statements** (`db.prepare()`) for all database operations. User-supplied parameters (such as Stellar addresses or query parameters) are bound safely, eliminating SQL injection vectors.

### 2. Cross-Origin Resource Sharing (CORS)
The backend server (`server/server.ts`) allows administrators to restrict API access by setting the `CORS_ORIGIN` environment variable in production (e.g. `CORS_ORIGIN=https://your-domain.com`).

### 3. Horizon Stream Resilience
The indexer stream (`server/indexer.ts`) uses connection keep-alives and backoff reconnect logic to handle Horizon endpoint rate limits, network disruptions, or node timeouts cleanly without exposing internal stack traces.

### 4. Input Validation & Address Verification
All incoming account queries are validated against Stellar public key standards (`G` prefix, 56 characters, base32 encoding) before hitting database or Horizon query routines.

---

## Reporting Vulnerabilities

We take security issues seriously. If you discover a vulnerability or potential security risk in PulseLayer, please report it responsibly.

### How to Report:
* **Email**: Send security disclosures to ` (or open a confidential issue if repository settings permit).
* **Details to Include**:
  - Type of issue (e.g., Denial of Service, SSRF, XSS, Resource Exhaustion).
  - Step-by-step reproduction instructions or Proof-of-Concept.
  - Affected components (`server/`, `src/`, database routines).

### Disclosure Timeline:
- **Initial Response**: Within 24 hours.
- **Triage & Assessment**: Within 72 hours.
- **Patch Release & Public Disclosure**: Coordinated after patch verification.

---

## Compliance & Privacy Statement

PulseLayer processes publicly available on-chain data from the Stellar public blockchain. It does not collect Personal Identifiable Information (PII), tracking cookies, or user telemetry.
