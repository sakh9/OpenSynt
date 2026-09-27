# OpenSynt

OpenSynt (Open Source Intelligence) is a web-based OSINT tool for quick first-pass investigations of IP addresses and domain names. It brings together network, ownership, location, and abuse-reputation data in one lookup, with a map and charts to make the results easier to review.

## Features

- Look up public IPv4, IPv6, and domain names
- View geolocation, WHOIS/RDAP, DNS, open-port, and abuse-reputation information
- Resolve domains and enrich them with data for their IPv4 address
- Explore location data on a map and review DNS and lookup activity charts
- Browse recent searches stored in the browser
- Export lookup results as JSON
- Cache lookup results in PostgreSQL and handle individual data-source failures gracefully

Some results depend on external services and may be unavailable or partial. AbuseIPDB data requires an API key; other providers may apply their own limits and availability policies.

## Tech stack

- **Frontend:** React 19, Vite, Tailwind CSS, Leaflet, Recharts, Axios
- **Backend:** Node.js, Express 5, PostgreSQL
- **Validation and security:** Zod, Helmet, CORS, express-rate-limit
- **Deployment:** Vercel (frontend) and Railway (backend/PostgreSQL)

## Run locally

### Requirements

- Node.js and npm
- PostgreSQL
- AbuseIPDB API key (optional; enables abuse-reputation lookups)

### 1. Install dependencies

From the repository root:

```bash
npm install
cd server
npm install
cd ../client
npm install
```

### 2. Configure the backend

Create `server/.env`:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/opensynt
CLIENT_URL=http://localhost:5173
ABUSEIPDB_KEY=
RATE_LIMIT_MAX=30
RATE_LIMIT_WINDOW_MS=900000
LOOKUP_CACHE_TTL_HOURS=24
```

Create the database named in `DATABASE_URL`, then apply the schema:

```bash
psql "$DATABASE_URL" -f server/src/db/schema.sql
```

Start the API from the `server` directory:

```bash
npm run dev
```

The API listens on port `5000` by default. Set `PORT` to change it.

### 3. Configure and start the frontend

Create `client/.env` if the API is not running at the default URL:

```env
VITE_API_URL=http://localhost:5000
```

Then start Vite from the `client` directory:

```bash
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

## API

The backend provides these endpoints:

| Endpoint | Method | Description |
|---|---|---|
| `/api/lookup` | `POST` | Look up an IP address or domain |
| `/api/lookup/activity` | `GET` | Return daily lookup activity for the last 14 days |
| `/api/lookup/stats` | `GET` | Return the total recorded lookup count |
| `/health` | `GET` | Check backend health |

Lookup request:

```json
{
  "query": "8.8.8.8"
}
```

The server validates and classifies the query. Private and reserved IP addresses are rejected. API requests are rate limited, and the backend allows browser origins listed in the comma-separated `CLIENT_URL` environment variable.

## Project structure

```text
OpenSynt/
├── client/
│   ├── src/
│   │   ├── components/opensynt/  # Maps, charts, and lookup UI components
│   │   ├── hooks/                # Recent-search browser storage
│   │   └── pages/OpenSynt.jsx    # Main application
│   └── package.json
├── server/
│   ├── src/
│   │   ├── db/                   # PostgreSQL pool and schema
│   │   ├── routes/               # Lookup and statistics endpoints
│   │   ├── services/             # External data providers
│   │   └── utils/                # Input validation and classification
│   ├── index.js
│   └── package.json
├── loadtest/
└── README.md
```

## License

MIT
