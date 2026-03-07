# AETERNA Enterprise Roadmap

This document outlines the gap analysis and roadmap to elevate AETERNA to an enterprise-grade system, based on industry standards.

## 1. Scaling & Performance
**Current Status:**
- ✅ **Foundation:** Built on Rust (`axum`, `tokio`) providing high performance and low footprint.
- ⚠️ **Architecture:** Monolithic state utilizing `Arc<Mutex<SovereignOrganism>>`.
- ⚠️ **Networking:** Binds to `127.0.0.1`, limiting container/orchestration deployment.

**Gaps:**
- **Horizontal Scaling:** State is in-memory. Multiple instances cannot share the "Organism" state.
- **Concurrency:** Global Mutex lock on every request creates a bottleneck under load.

**Roadmap:**
- [x] Change bind address to `0.0.0.0` for Docker/K8s compatibility.
- [ ] Decouple state from memory to persistent storage (PostgreSQL/Redis).
- [ ] Implement caching layer for high-read endpoints (`/telemetry`).

## 2. Security
**Current Status:**
- ⚠️ **Authentication:** No mechanism visible in `main.rs`. All commands are open.
- ⚠️ **CORS:** `CorsLayer::permissive()` allows all origins.
- ⚠️ **Secrets:** Secrets managed via `.soul` files and env vars (mixed approach).

**Gaps:**
- **Access Control:** No RBAC or Authentication (SSO/OAuth).
- **Transport:** No internal TLS (relying on potential external termination).

**Roadmap:**
- [ ] Implement API Key or JWT Middleware.
- [ ] Restrict CORS to trusted domains.
- [ ] Integrate with Vault or K8s Secrets for sensitive data.
- [ ] Audit `unwrap()` calls to prevent DoS via panic.

## 3. Reliability & Observability
**Current Status:**
- ✅ **Telemetry:** Basic CPU/RAM/Entropy monitoring exists.
- ⚠️ **Logging:** Uses standard `println!` (unstructured).
- ⚠️ **Health:** No standardized liveness/readiness probes.

**Gaps:**
- **Logs:** Not machine-readable (JSON), making integration with ELK/Splunk difficult.
- **Error Handling:** Usage of `unwrap()` poses stability risks.

**Roadmap:**
- [x] Implement `/health` endpoint for Load Balancers.
- [x] Replace `println!` with structured logging (`tracing` crate).
- [ ] Implement graceful shutdown handling.

## 4. Configuration & Management
**Current Status:**
- ⚠️ **Config:** Hardcoded paths (`../AETERNA_ANIMA.soul`) and Windows-style paths (`C:\\RUST-LANGUAGE...`).

**Gaps:**
- **Portability:** Pathing is not OS-agnostic.
- **Environment:** Dockerfile exists, but app logic assumes local file presence at specific relative paths.

**Roadmap:**
- [ ] Externalize configuration completely (ConfigMap/Env Vars).
- [ ] Normalize file paths for Linux/Cloud environments.

## 5. Integrations & Business Process
**Current Status:**
- ✅ **Crypto:** Binance integration for wealth management.
- ✅ **API:** REST-like endpoints for command and control.

**Gaps:**
- **API Standards:** Custom JSON structure. OpenAPI (Swagger) spec missing.

**Roadmap:**
- [ ] Generate OpenAPI/Swagger documentation.
- [ ] Standardize API responses.

---

## Immediate Next Steps (Quick Wins)
1. Bind to `0.0.0.0`.
2. Add `/health` endpoint.
3. Integrate structured logging.
