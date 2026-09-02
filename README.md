# Fiori App — SAP Fiori PoC Demo App

Self-contained SAPUI5 / OpenUI5 demo app that backs the agent PoC. No backend — static JSON + `localStorage` ordering. Deploys as static files (nginx) or `python -m http.server`.

## Quick start

```sh
# serve directly (no build)
make serve
# -> http://localhost:8080  (login: demo / password123)

# offline UI5 runtime (one-time, ~71 MB, for offline demos)
make vendor-ui5

# docker
make docker-up   # nginx on 127.0.0.1:8080
make docker-down
```

Offline: with `resources/` vendored (`make vendor-ui5`) the app runs fully offline. Without it, `index.html` falls back to `https://sdk.openui5.org/1.151.0`.

## Pages & routes

| Route                     | View            | Data                                                                                    |
| ------------------------- | --------------- | --------------------------------------------------------------------------------------- |
| `#/dashboard`             | Sales Dashboard | `data/sales.json` (12 orders)                                                           |
| `#/catalog`               | Product Catalog | `data/products.json` (15 products; inactive/zero-stock hidden, 11 orderable)            |
| `#/orders`                | Order History   | 2026-only filter of `sales.json` + catalog orders (`localStorage` `poc.orders.created`) |
| `#/customer/{customerId}` | Customer Detail | `data/customers.json` + that customer's 2026 orders                                     |

Catalog ordering is client-side: qty → Add to Order → `localStorage` → `Pending` in Order History.

## Project layout

```
fiori-app/
  index.html          # UI5 bootstrap (vendored resources/ or CDN fallback)
  Dockerfile          # nginx:alpine static serve
  docker-compose.yml  # 127.0.0.1:8080 only
  data/               # sales.json / products.json / customers.json
  webapp/
    Component.js / manifest.json
    view/ / controller/ / css/ / img/ / util/
  resources/          # gitignored OpenUI5 runtime (make vendor-ui5)
  scripts/vendor_ui5.sh
```

## Deployment

- **Docker**: `docker compose up -d --build` exposes `127.0.0.1:8080` (`nginx:alpine`, `COPY . /usr/share/nginx/html`). Healthcheck via `wget --spider`.
- **Static hosting**: any static file host serving `index.html` at root works (S3+CloudFront, nginx, `http.server`). No server-side code.
- **Env**: none. Demo credentials are client-side (`demo` / `password123`) — this is a UI gate, not real auth.

## Companion repo

The agent that drives this app lives in `../agent` (future separate repo). Point it at this app via:

```sh
SAP_AGENT_URL=http://localhost:8080 SAP_AGENT_USER=demo SAP_AGENT_PASSWORD=password123
```
