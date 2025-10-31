# PowerSync Performance Benchmark Suite

A comprehensive benchmarking suite comparing [PowerSync](https://powersync.com) performance between two SQLite implementations:
- **Web (wa-sqlite)**: WebAssembly-based SQLite for browser/Electron renderer
- **Node (better-sqlite3)**: Native C++ SQLite bindings for Node.js/Electron main process

## What This Repository Does

This project benchmarks PowerSync's performance using the standard SQLite benchmark test suite (15 tests) across two different SQLite engines. The goal is to quantify the performance differences between WebAssembly and native implementations when using PowerSync for offline-first applications.

**Key Features:**
- 15 standardized SQLite performance tests
- Side-by-side comparison of wa-sqlite vs better-sqlite3
- Real PowerSync integration with local Supabase backend
- JSON export for result analysis
- Identical test data using seeded random generation

## Repository Structure

```
benchmark-powersync-electron/
├── apps/
│   ├── benchmark-web/           # Web benchmark (wa-sqlite)
│   ├── benchmark-node/          # Node benchmark (better-sqlite3)
│   └── vite-react-ts-powersync-supabase/  # Reference app with local stack
├── packages/
│   └── sql-gen/                 # Shared benchmark test generator
└── BENCHMARK.md                 # Detailed benchmarking guide
```

### Apps

- **benchmark-web**: React + Vite app using PowerSync Web SDK and wa-sqlite
- **benchmark-node**: Node.js CLI using PowerSync Node SDK and better-sqlite3
- **vite-react-ts-powersync-supabase**: Reference app providing local Supabase + PowerSync infrastructure

### Packages

- **sql-gen**: Generates reproducible SQL benchmark tests compatible with PowerSync

## Prerequisites

Before running benchmarks, ensure you have:

- **Docker** - for running local Supabase and PowerSync
- **Supabase CLI** - `npm install -g supabase`
- **pnpm** - package manager
- **Node.js** - v18 or later

## Quick Setup

### 1. Install Dependencies

```bash
# From repository root
pnpm install
```

### 2. Start Local Infrastructure

```bash
# Terminal 1: Start Supabase (takes ~5 minutes first time)
cd apps/vite-react-ts-powersync-supabase
npm run dev:supabase

# Terminal 2: Start PowerSync
cd apps/vite-react-ts-powersync-supabase
npm run dev:powersync
```

**Verify services are running:**
```bash
# Check Supabase
supabase status

# Check PowerSync
docker ps | grep powersync_demo
```

### 3. Initialize Database Schema

```bash
# Create benchmark tables in Postgres
cd apps/vite-react-ts-powersync-supabase
supabase db reset
```

This creates tables `t1` through `t16` in your local Supabase database.

### 4. Deploy Sync Rules

Deploy the sync rules to PowerSync so it knows which tables to sync:

```bash
cd apps/vite-react-ts-powersync-supabase

# Deploy via API
curl -X PUT http://localhost:9090/api/sync-rules \
  -H "Content-Type: application/yaml" \
  --data-binary @sync-rules.yaml
```

**Or use the PowerSync UI:**
- Open http://localhost:9090
- Navigate to sync rules
- Paste contents of `sync-rules.yaml`
- Click Deploy

### 5. Get Supabase Credentials

```bash
# Get the anonymous key
cd apps/vite-react-ts-powersync-supabase
supabase status
```

Copy the `anon key` value - you'll need it for both benchmark apps.

### 6. Configure Benchmark Apps

**Web Benchmark:**
```bash
cd apps/benchmark-web
cp env.template .env.local
# Edit .env.local and paste the anon key
```

**Node Benchmark:**
```bash
cd apps/benchmark-node
cp env.template .env.local
# Edit .env.local and paste the anon key
```

## Running Benchmarks

### Web Benchmark (wa-sqlite)

```bash
cd apps/benchmark-web
pnpm install
pnpm dev
```

Open your browser to http://localhost:5173:
- Click "Run Quick Tests (1-3)" for validation
- Click "Run All Benchmarks" for full test suite
- Click "Export Results (JSON)" to download results

### Node Benchmark (better-sqlite3)

```bash
cd apps/benchmark-node
pnpm install
pnpm start              # Run all 15 tests
# or
pnpm start quick        # Run only tests 1-3
```

Results are automatically exported to a JSON file.

## Accessing Services

While running:
- **Supabase Studio**: http://localhost:54323 (database UI)
- **PowerSync Admin**: http://localhost:9090 (sync rules, monitoring)
- **Web Benchmark**: http://localhost:5173 (when running)

## Understanding Results

Both apps export results in the same JSON format:

```json
{
  "timestamp": "2025-10-31T02:42:02.226Z",
  "engine": "wa-sqlite" | "better-sqlite3",
  "sdkVersion": "1.x.x",
  "results": [
    {
      "testNumber": 1,
      "testDescription": "Test 1: 1000 INSERTs",
      "duration": 245.67,
      "statementsExecuted": 1002
    }
  ]
}
```

Compare the `duration` values between web and node results to see performance differences.

## Troubleshooting

### Services Won't Start

```bash
# Restart Supabase
supabase stop && supabase start

# Restart PowerSync
docker restart powersync_demo
```

### Tables Not Found (404 errors)

Run database initialization:
```bash
cd apps/vite-react-ts-powersync-supabase
supabase db reset
```

### Sync Rules Error

Deploy sync rules:
```bash
cd apps/vite-react-ts-powersync-supabase
curl -X PUT http://localhost:9090/api/sync-rules \
  -H "Content-Type: application/yaml" \
  --data-binary @sync-rules.yaml
```

### Connection Issues

- Verify `.env.local` files have correct URLs and anon key
- Check firewall isn't blocking localhost
- Ensure Docker is running

## Documentation

- **[BENCHMARK.md](./BENCHMARK.md)** - Comprehensive benchmarking guide
- **[apps/benchmark-web/README.md](./apps/benchmark-web/README.md)** - Web benchmark details
- **[apps/benchmark-node/README.md](./apps/benchmark-node/README.md)** - Node benchmark details
- **[packages/sql-gen/README.md](./packages/sql-gen/README.md)** - Test generation
- **[packages/sql-gen/POWERSYNC.md](./packages/sql-gen/POWERSYNC.md)** - PowerSync integration

## License

MIT
