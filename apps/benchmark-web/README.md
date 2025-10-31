# PowerSync Web Benchmark App

This app benchmarks PowerSync performance using **wa-sqlite** (WebAssembly SQLite) in a browser-based environment.

## Prerequisites

Before running this app, ensure you have the local Supabase and PowerSync stack running:

1. **Docker** - for running local Supabase and PowerSync
2. **Supabase CLI** - for local Supabase instance
3. **pnpm** - package manager

## Setup

### 1. Start Local Infrastructure

First, navigate to the reference app directory and start the local services:

```bash
# From the root of the monorepo
cd apps/vite-react-ts-powersync-supabase

# Start Supabase (this will take a few minutes on first run)
npm run dev:supabase

# In a separate terminal, start PowerSync
npm run dev:powersync
```

Wait for both services to be fully running before proceeding.

### 2. Get Supabase Credentials

After Supabase starts, get the anonymous key:

```bash
# From apps/vite-react-ts-powersync-supabase directory
supabase status
```

Look for the `anon key` in the output.

### 3. Configure Environment

```bash
# From apps/benchmark-web directory
cp .env.local.template .env.local
```

Edit `.env.local` and replace `your-anon-key-here` with the actual anon key from the previous step.

### 4. Install Dependencies

```bash
# From apps/benchmark-web directory
pnpm install
```

### 5. Initialize Database Schema

The benchmark tables need to be created in Supabase. From the `apps/vite-react-ts-powersync-supabase` directory:

```bash
# Apply the database schema
supabase db reset
```

This will create the benchmark tables (t1-t16) in your local Supabase instance.

## Running the Benchmarks

Start the development server:

```bash
pnpm dev
```

Open your browser to the URL shown (typically http://localhost:5173).

### Using the App

1. **Wait for Connection**: The app will connect to local PowerSync. Wait for "Connected: ✅" status.
2. **Run Quick Tests**: Click "Run Quick Tests (1-3)" to run the first 3 benchmarks (quick validation).
3. **Run All Benchmarks**: Click "Run All Benchmarks" to run all 15 benchmark tests.
4. **Export Results**: After tests complete, click "Export Results (JSON)" to download the results.

## Benchmark Tests

The app runs 15 standard SQLite benchmark tests:

1. Test 1: 1000 INSERTs
2. Test 2: 25000 INSERTs in a transaction
3. Test 3: 25000 INSERTs into an indexed table
4. Test 4: 100 SELECTs without an index
5. Test 5: 100 SELECTs on a string comparison
6. Test 7: 5000 SELECTs with an index
7. Test 8: 1000 UPDATEs without an index
8. Test 9: 25000 UPDATEs with an index
9. Test 10: 25000 text UPDATEs with an index
10. Test 11: INSERTs from a SELECT
11. Test 12: DELETE without an index
12. Test 13: DELETE with an index
13. Test 14: A big INSERT after a big DELETE
14. Test 15: A big DELETE followed by many small INSERTs
15. Test 16: Clear table

## Architecture

- **Frontend**: React + TypeScript
- **Build Tool**: Vite
- **SQLite**: wa-sqlite (WebAssembly)
- **PowerSync**: @powersync/web (Web SDK)
- **Backend**: Local Supabase + PowerSync

## Comparing with Node Benchmark

To compare performance with the Node implementation:

1. Run this web benchmark and export results
2. Run the `benchmark-node` app (see ../benchmark-node/README.md)
3. Compare the exported JSON files

The Node version uses better-sqlite3 (native C++ binding) while this web version uses wa-sqlite (WebAssembly), so expect some performance differences.

## Troubleshooting

### Connection Issues

- Ensure Supabase is running: `supabase status`
- Ensure PowerSync is running: `docker ps` (should see `powersync_demo` container)
- Check `.env.local` has correct URLs and keys

### Schema Issues

- If tables don't exist, run `supabase db reset` from the `vite-react-ts-powersync-supabase` directory
- Verify sync rules in `apps/vite-react-ts-powersync-supabase/sync-rules.yaml` include benchmark tables

### Performance Issues

- Close other tabs/applications
- Run benchmarks in a clean browser session
- Disable browser extensions that might interfere
- Check browser console for errors

## Development

Build for production:

```bash
pnpm build
```

Preview production build:

```bash
pnpm preview
```

Type check:

```bash
pnpm type-check
```

