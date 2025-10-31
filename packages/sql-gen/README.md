# SQL Generator Package

This package generates SQL statements for database benchmarking tests based on the SQLite Speed Test. It includes both standard SQLite tests and PowerSync-compatible tests.

## Features

Generates reproducible SQL statements for 15 different benchmark tests:
- **Test 1**: 1000 INSERTs
- **Test 2**: 25000 INSERTs in a transaction
- **Test 3**: 25000 INSERTs into an indexed table
- **Test 4**: 100 SELECTs without an index
- **Test 5**: 100 SELECTs on a string comparison
- **Test 7**: 5000 SELECTs with an index
- **Test 8**: 1000 UPDATEs without an index
- **Test 9**: 25000 UPDATEs with an index
- **Test 10**: 25000 text UPDATEs with an index
- **Test 11**: INSERTs from a SELECT
- **Test 12**: DELETE without an index
- **Test 13**: DELETE with an index
- **Test 14**: A big INSERT after a big DELETE
- **Test 15**: A big DELETE followed by many small INSERTs
- **Test 16**: Clear table

### Included Files

- **`generate-tests.ts`**: Standard SQLite benchmark tests (uses CREATE TABLE/DROP TABLE)
- **`generate-powersync-tests.ts`**: PowerSync-compatible benchmark tests (uses DELETE to clear, includes id column)
- **`powersync-schema.ts`**: PowerSync schema definition for benchmark tables

## Usage

### Standard SQLite Tests

```typescript
import { test1, test2, test3 } from 'sql-gen';

// Generate SQL for Test 1 with seed 42 (default)
const result = test1(42);

console.log(result.testDescription); // "Test 1: 1000 INSERTs"
console.log(result.sqlStatements.length); // Number of statements

// Execute the statements
for (const statement of result.sqlStatements) {
  db.execute(statement);
}
```

### PowerSync Tests

```typescript
import { PowerSyncTests, BenchmarkSchema } from 'sql-gen';

// Use BenchmarkSchema when initializing PowerSync
const db = new PowerSyncDatabase({
  schema: BenchmarkSchema,
  // ... other config
});

// Generate and run PowerSync-compatible tests
const result = PowerSyncTests.test1(42);

console.log(result.testDescription); // "Test 1: 1000 INSERTs"

// Execute statements
for (const statement of result.sqlStatements) {
  await db.execute(statement);
}
```

## Differences Between Standard and PowerSync Tests

### Standard Tests (`generate-tests.ts`)
- Uses `DROP TABLE IF EXISTS` and `CREATE TABLE` statements
- Tables have 3 columns: `a INTEGER`, `b INTEGER`, `c TEXT`
- Designed for raw SQLite databases

### PowerSync Tests (`generate-powersync-tests.ts`)
- Uses `DELETE FROM` to clear tables instead of DROP/CREATE (PowerSync manages schema via sync rules)
- Tables have 4 columns: `id TEXT` (UUID, required by PowerSync), `a INTEGER`, `b INTEGER`, `c TEXT`
- All INSERT statements explicitly include the `id` column with UUID values
- Uses `CREATE INDEX IF NOT EXISTS` instead of `CREATE INDEX`
- Fully compatible with PowerSync's schema management and sync operations

### PowerSync Schema

The `BenchmarkSchema` exported from `powersync-schema.ts` includes all benchmark tables (t1-t16, excluding t6) with the structure:

```typescript
{
  id: column.text,      // Auto-added by PowerSync as primary key
  a: column.integer,
  b: column.integer,
  c: column.text
}
```

## Building

```bash
pnpm run build
```

This compiles the TypeScript source to JavaScript in the `dist/` directory.

## Development

The package uses:
- **TypeScript** for type safety
- **@faker-js/faker** for generating reproducible random test data

Each test function takes an optional `seed` parameter (default: 42) to ensure reproducible results across runs.

