# PowerSync Performance Benchmarking: Web vs Node

This benchmark suite compares PowerSync performance between two SQLite implementations:
- **Web (wa-sqlite)**: WebAssembly-based SQLite running in browser/Electron renderer
- **Node (better-sqlite3)**: Native C++ SQLite binding running in Node.js/Electron main process

## Benchmark Test Suite

All tests run against the same PowerSync schema with local Supabase and PowerSync instances.

### The 15 Standard Tests

1. **Test 1**: 1000 INSERTs
2. **Test 2**: 25000 INSERTs in a transaction
3. **Test 3**: 25000 INSERTs into an indexed table
4. **Test 4**: 100 SELECTs without an index
5. **Test 5**: 100 SELECTs on a string comparison
6. **Test 7**: 5000 SELECTs with an index
7. **Test 8**: 1000 UPDATEs without an index
8. **Test 9**: 25000 UPDATEs with an index
9. **Test 10**: 25000 text UPDATEs with an index
10. **Test 11**: INSERTs from a SELECT
11. **Test 12**: DELETE without an index
12. **Test 13**: DELETE with an index
13. **Test 14**: A big INSERT after a big DELETE
14. **Test 15**: A big DELETE followed by many small INSERTs
15. **Test 16**: Clear table

## Quick Start

### Prerequisites

1. **Docker** - for running local Supabase and PowerSync
2. **Supabase CLI** - `npm install -g supabase`
3. **pnpm** - package manager
4. **Node.js** - v18 or later

### Step 1: Start Local Infrastructure

```bash
# From the root of the monorepo
cd apps/vite-react-ts-powersync-supabase

# Start Supabase (first time takes ~5 minutes)
npm run dev:supabase

# In a separate terminal, start PowerSync
npm run dev:powersync
```

Verify services are running:
```bash
# Check Supabase
supabase status

# Check PowerSync
docker ps | grep powersync_demo
```

### Step 2: Initialize Database Schema

```bash
# From apps/vite-react-ts-powersync-supabase
supabase db reset
```

This creates all benchmark tables (t1-t16) in your local Supabase instance.

### Step 3: Get Supabase Anonymous Key

```bash
# From apps/vite-react-ts-powersync-supabase
supabase status
```

Copy the `anon key` value - you'll need it for both benchmark apps.

### Step 4: Configure Benchmark Apps

#### For Web Benchmark:
```bash
cd apps/benchmark-web
cp env.template .env.local
# Edit .env.local and paste the anon key
pnpm install
```

#### For Node Benchmark:
```bash
cd apps/benchmark-node
cp env.template .env.local
# Edit .env.local and paste the anon key
pnpm install
```

### Step 5: Run Benchmarks

#### Web Benchmark (wa-sqlite):
```bash
cd apps/benchmark-web
pnpm dev
# Open browser to http://localhost:5173
# Click "Run All Benchmarks" or "Run Quick Tests"
# Export results as JSON
```

#### Node Benchmark (better-sqlite3):
```bash
cd apps/benchmark-node
pnpm start
# Results automatically exported to JSON file
```

## Understanding Results

### Result Format

Both apps export results in the same JSON format:

```json
{
  "timestamp": "2025-01-15T10:30:00.000Z",
  "engine": "wa-sqlite" | "better-sqlite3",
  "sdkVersion": "1.x.x",
  "results": [
    {
      "testNumber": 1,
      "testDescription": "Test 1: 1000 INSERTs",
      "duration": 245.67,
      "statementsExecuted": 1002
    },
    ...
  ]
}
```

### Comparing Results

To compare performance:

1. Run both benchmarks
2. Export results from both apps
3. Compare the `duration` values for each test
4. Calculate percentage difference:
   ```
   improvement = ((node_time - web_time) / node_time) * 100
   ```

### Expected Performance Characteristics

**Generally:**
- **better-sqlite3** (Node) is typically faster due to native C++ execution
- **wa-sqlite** (Web) has some WebAssembly overhead but still performs well
- **INSERT operations**: Node usually 20-40% faster
- **SELECT operations**: Node usually 10-30% faster
- **Complex transactions**: Similar performance due to I/O being the bottleneck

**Factors affecting results:**
- System load and available resources
- Disk I/O speed
- Browser vs Node.js JavaScript engine differences
- PowerSync sync overhead (if actively syncing)

## Architecture Details

### Web Benchmark App (benchmark-web)

**Stack:**
- React + TypeScript + Vite
- PowerSync Web SDK (@powersync/web)
- wa-sqlite (WebAssembly SQLite)
- OPFSCoopSyncVFS (Origin Private File System)

**Advantages:**
- Runs in any modern browser
- Good browser compatibility
- Isolated storage (OPFS)

**Limitations:**
- WebAssembly overhead
- Browser security restrictions
- Limited to single-threaded execution

### Node Benchmark App (benchmark-node)

**Stack:**
- Node.js + TypeScript
- PowerSync Node SDK (@powersync/node)
- better-sqlite3 (native C++ SQLite)

**Advantages:**
- Native performance
- Full Node.js ecosystem
- Multi-threading possible

**Limitations:**
- Requires Node.js runtime
- Platform-specific binaries
- More complex deployment

## PowerSync-Specific Considerations

Both apps use PowerSync with the following configuration:

- **Schema**: BenchmarkSchema from `sql-gen` package
- **Tables**: t1-t16 (standard benchmark tables with id, a, b, c columns)
- **Sync**: Connected to local PowerSync instance
- **Auth**: Anonymous Supabase authentication

### Key Differences from Raw SQLite

PowerSync adds:
1. **UUID primary keys**: All tables have `id TEXT PRIMARY KEY`
2. **Sync metadata**: Additional columns for sync tracking
3. **Transaction overhead**: Sync operations add minimal overhead
4. **Network latency**: Initial sync from backend (one-time cost)

## Troubleshooting

### Services Not Running

```bash
# Check Supabase
supabase status

# Restart Supabase if needed
supabase stop
supabase start

# Check PowerSync
docker ps
docker restart powersync_demo
```

### Connection Errors

- Verify `.env.local` files have correct URLs
- Ensure anon key is correct
- Check firewall isn't blocking localhost connections

### Schema/Sync Issues

- Run `supabase db reset` to recreate tables
- Verify sync-rules.yaml includes all benchmark tables
- Check PowerSync logs: `docker logs powersync_demo`

### Performance Anomalies

- Close other applications
- Run benchmarks multiple times and average
- Ensure laptop is plugged in (not on battery)
- Disable browser extensions
- Clear browser cache (for web benchmark)

## Advanced Usage

### Custom Test Subsets

**Web**: Modify `BenchmarkRunner.tsx` to customize which tests run

**Node**: Pass test numbers as arguments (future enhancement)

### Running Without PowerSync Sync

To benchmark pure SQLite performance without sync overhead, disconnect before running:

```typescript
// In benchmark code
await db.disconnect();
// Run benchmarks
```

### Profiling

**Web**: Use browser DevTools Performance tab

**Node**: Use Node.js `--prof` flag or clinic.js

## CI/CD Integration

For automated benchmarking:

1. Use GitHub Actions or similar
2. Start Supabase/PowerSync in CI
3. Run both benchmarks
4. Compare results against baseline
5. Fail if performance regresses > threshold

Example workflow snippet:
```yaml
- name: Run Node Benchmark
  run: |
    cd apps/benchmark-node
    pnpm start > results.txt
    # Parse and compare results
```

## Contributing

To add new benchmark tests:

1. Add test function to `packages/sql-gen/src/generate-powersync-tests.ts`
2. Export from `packages/sql-gen/src/index.ts`
3. Update both benchmark apps to include the new test
4. Update this documentation

## Related Documentation

- [sql-gen Package](./packages/sql-gen/README.md) - Test generation
- [PowerSync Integration](./packages/sql-gen/POWERSYNC.md) - PowerSync specifics
- [Web Benchmark App](./apps/benchmark-web/README.md) - Detailed web setup
- [Node Benchmark App](./apps/benchmark-node/README.md) - Detailed node setup
