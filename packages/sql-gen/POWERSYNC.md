# PowerSync Integration Guide

This document explains how the sql-gen package has been adapted to support PowerSync benchmarks.

## What Was Created

### 1. PowerSync Schema (`powersync-schema.ts`)

A complete PowerSync schema definition for all benchmark tables (t1-t16, plus t11_source). Each table follows PowerSync's requirements:

- **Automatic ID column**: PowerSync automatically adds an `id` column (TEXT/UUID) as the primary key
- **Column types**: Uses PowerSync column types (`column.integer`, `column.text`)
- **Schema registration**: All tables are registered in the `BenchmarkSchema` for sync management

### 2. PowerSync-Compatible SQL Tests (`generate-powersync-tests.ts`)

Modified versions of all 15 benchmark tests that work with PowerSync:

**Key Differences from Standard Tests:**

1. **Table Management**: Uses `DELETE FROM` instead of `DROP TABLE`/`CREATE TABLE` since PowerSync manages table schemas via sync rules
2. **ID Column**: All INSERT statements include explicit `id` values (UUIDs)
3. **Indexes**: Uses `CREATE INDEX IF NOT EXISTS` for idempotency
4. **Column List**: Explicitly specifies columns in INSERT statements: `INSERT INTO t1 (id, a, b, c) VALUES(...)`

### 3. Updated Package Structure

- Standard tests: `import { test1, test2, ... } from 'sql-gen'`
- PowerSync tests: `import { PowerSyncTests } from 'sql-gen'`
- PowerSync schema: `import { BenchmarkSchema } from 'sql-gen'`

## Using with PowerSync

```typescript
import { PowerSyncDatabase } from '@powersync/web';
import { PowerSyncTests, BenchmarkSchema } from 'sql-gen';

// Initialize PowerSync with benchmark schema
const db = new PowerSyncDatabase({
  schema: BenchmarkSchema,
  database: {
    dbFilename: 'benchmark.db'
  }
});

// Run a benchmark test
async function runBenchmark(testNumber: number) {
  const testFn = PowerSyncTests[`test${testNumber}`];
  const result = testFn(42); // Use seed 42 for reproducibility

  console.log(`Running: ${result.testDescription}`);
  const startTime = performance.now();

  for (const sql of result.sqlStatements) {
    await db.execute(sql);
  }

  const duration = performance.now() - startTime;
  console.log(`Completed in ${duration.toFixed(2)}ms`);
}

// Run all tests
async function runAllBenchmarks() {
  const tests = [1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

  for (const testNum of tests) {
    await runBenchmark(testNum);
  }
}
```

## Schema Structure

Each benchmark table has the following structure:

```sql
CREATE TABLE t1 (
  id TEXT PRIMARY KEY,  -- Auto-managed by PowerSync
  a INTEGER,
  b INTEGER,
  c TEXT
);
```

Tests that require indexed lookups (7, 9, 10, 13) use the primary key (`id` column) instead of creating additional indexes, since PowerSync tables are implemented as views and cannot have indexes created on them.

## Important Notes

1. **No DDL in Production**: PowerSync manages table schemas. In a real sync scenario, tables would be created via backend sync rules, not client-side DDL.

2. **Local-Only Testing**: These benchmarks are designed for local PowerSync testing without an active sync connection.

3. **UUID Generation**: Test data uses faker.js to generate UUIDs for the `id` column, ensuring uniqueness.

4. **Seed Values**: All tests use a seed parameter (default: 42) to ensure reproducible results across benchmark runs.

## Benchmark Tests

All 14 standard SQLite benchmark tests are available:

- Test 1: 1000 INSERTs
- Test 2: 25000 INSERTs in a transaction
- Test 4: 100 SELECTs without an index
- Test 5: 100 SELECTs on a string comparison
- Test 7: 5000 SELECTs using primary key
- Test 8: 1000 UPDATEs without an index
- Test 9: 25000 UPDATEs using primary key
- Test 10: 25000 text UPDATEs using primary key
- Test 11: INSERTs from a SELECT
- Test 12: DELETE without an index
- Test 13: DELETE using primary key
- Test 14: A big INSERT after a big DELETE
- Test 15: A big DELETE followed by many small INSERTs
- Test 16: Clear table

## Comparing Results

You can compare PowerSync performance against raw SQLite by running both test suites:

```typescript
import { test1 as sqliteTest1 } from 'sql-gen'; // Standard SQLite
import { PowerSyncTests } from 'sql-gen';       // PowerSync version

// Run SQLite test
const sqliteResult = sqliteTest1();
// Execute against raw SQLite DB...

// Run PowerSync test
const powersyncResult = PowerSyncTests.test1();
// Execute against PowerSync DB...
```

Both will use identical test data (same seed), allowing for fair performance comparisons.

