# PowerSync Node Benchmark App

This app benchmarks PowerSync performance using **better-sqlite3** (native C++ SQLite binding) in a Node.js environment.

## Prerequisites

Before running this app, ensure you have the local Supabase and PowerSync stack running:

1. **Docker** - for running local Supabase and PowerSync
2. **Supabase CLI** - for local Supabase instance
3. **pnpm** - package manager
4. **Node.js** - v18 or later

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
# From apps/benchmark-node directory
cp env.template .env.local
```

Edit `.env.local` and replace `your-anon-key-here` with the actual anon key from the previous step.

### 4. Install Dependencies

```bash
# From apps/benchmark-node directory
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

### Run All Benchmarks

```bash
pnpm start
# or
pnpm start all
```

This will run all 15 benchmark tests and export results to a JSON file.

### Run Quick Tests Only

```bash
pnpm start quick
```

This runs only tests 1-3 for quick validation.

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

## Output

The benchmark will:
1. Print progress to the console
2. Show a summary with timing statistics
3. Export results to a JSON file (e.g., `benchmark-node-results-2025-01-15T10-30-00-000Z.json`)

Example output:
```
🚀 Starting PowerSync Node Benchmark Suite
============================================================
Engine: better-sqlite3 (native)
PowerSync SDK Version: 1.x.x
============================================================

📊 Running: Test 1: 1000 INSERTs
   Statements: 1002
   ✅ Completed in 245.67ms

...

📈 Benchmark Summary
============================================================
Total tests: 15
Total time: 12345.67ms
Total statements: 375042
Average time per test: 823.04ms

Detailed Results:
------------------------------------------------------------
  Test 1:     245.67ms - Test 1: 1000 INSERTs
  Test 2:     890.23ms - Test 2: 25000 INSERTs in a transaction
  ...
============================================================

📁 Results exported to: benchmark-node-results-2025-01-15T10-30-00-000Z.json
```

## Architecture

- **Runtime**: Node.js
- **SQLite**: better-sqlite3 (native C++ binding)
- **PowerSync**: @powersync/node (Node SDK)
- **Backend**: Local Supabase + PowerSync

## Comparing with Web Benchmark

To compare performance with the Web implementation:

1. Run this node benchmark: `pnpm start`
2. Run the web benchmark (see ../benchmark-web/README.md)
3. Compare the exported JSON files

The Node version uses better-sqlite3 (native C++) while the web version uses wa-sqlite (WebAssembly). Generally, better-sqlite3 should be faster due to native execution, but actual results depend on many factors.

## Troubleshooting

### Connection Issues

- Ensure Supabase is running: `supabase status`
- Ensure PowerSync is running: `docker ps` (should see `powersync_demo` container)
- Check `.env.local` has correct URLs and keys

### Schema Issues

- If tables don't exist, run `supabase db reset` from the `vite-react-ts-powersync-supabase` directory
- Verify sync rules in `apps/vite-react-ts-powersync-supabase/sync-rules.yaml` include benchmark tables

### SQLite Errors

- Delete the database file: `rm benchmark-node.db*`
- Reinstall better-sqlite3: `pnpm install --force`

### Module Resolution Errors

- Ensure all imports use `.js` extension (TypeScript requirement for ESM)
- Check `tsconfig.json` has `"moduleResolution": "bundler"`

## Development

Build TypeScript:

```bash
pnpm build
```

Type check without building:

```bash
pnpm type-check
```

Run without building (using tsx):

```bash
pnpm start
```

