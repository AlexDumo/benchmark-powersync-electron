/**
 * Example: Running PowerSync Benchmarks
 *
 * This file demonstrates how to use the sql-gen package to run
 * benchmark tests against a PowerSync database.
 */

import { PowerSyncDatabase } from '@powersync/web';
import { PowerSyncTests, BenchmarkSchema } from './src/index.js';

// Type for benchmark results
interface BenchmarkResult {
  testNumber: number;
  testDescription: string;
  duration: number; // milliseconds
  statementsExecuted: number;
}

/**
 * Initialize a PowerSync database with the benchmark schema
 */
async function initDatabase(): Promise<PowerSyncDatabase> {
  const db = new PowerSyncDatabase({
    schema: BenchmarkSchema,
    database: {
      dbFilename: 'benchmark.db'
    }
  });

  await db.init();
  return db;
}

/**
 * Run a single benchmark test
 */
async function runBenchmark(
  db: PowerSyncDatabase,
  testNumber: number,
  seed = 42
): Promise<BenchmarkResult> {
  // Get the test function
  const testKey = `test${testNumber}` as keyof typeof PowerSyncTests;
  const testFn = PowerSyncTests[testKey];

  if (!testFn || typeof testFn !== 'function') {
    throw new Error(`Test ${testNumber} not found`);
  }

  // Generate test SQL
  const result = testFn(seed);

  console.log(`\n📊 Running: ${result.testDescription}`);
  console.log(`   Statements: ${result.sqlStatements.length}`);

  // Execute all SQL statements and measure time
  const startTime = performance.now();

  for (const sql of result.sqlStatements) {
    await db.execute(sql);
  }

  const duration = performance.now() - startTime;

  console.log(`   ✅ Completed in ${duration.toFixed(2)}ms`);

  return {
    testNumber,
    testDescription: result.testDescription,
    duration,
    statementsExecuted: result.sqlStatements.length
  };
}

/**
 * Run all benchmark tests
 */
async function runAllBenchmarks(seed = 42): Promise<BenchmarkResult[]> {
  const db = await initDatabase();
  const results: BenchmarkResult[] = [];

  // All available test numbers (note: test 6 doesn't exist in the suite)
  const testNumbers = [1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

  console.log('🚀 Starting PowerSync Benchmark Suite');
  console.log('=====================================');

  for (const testNum of testNumbers) {
    try {
      const result = await runBenchmark(db, testNum, seed);
      results.push(result);
    } catch (error) {
      console.error(`❌ Error running test ${testNum}:`, error);
    }
  }

  // Print summary
  console.log('\n📈 Benchmark Summary');
  console.log('===================');

  const totalTime = results.reduce((sum, r) => sum + r.duration, 0);
  const totalStatements = results.reduce((sum, r) => sum + r.statementsExecuted, 0);

  console.log(`Total tests: ${results.length}`);
  console.log(`Total time: ${totalTime.toFixed(2)}ms`);
  console.log(`Total statements: ${totalStatements}`);
  console.log(`Average time per test: ${(totalTime / results.length).toFixed(2)}ms`);

  // Print detailed results
  console.log('\nDetailed Results:');
  results.forEach(r => {
    console.log(`  Test ${r.testNumber}: ${r.duration.toFixed(2)}ms - ${r.testDescription}`);
  });

  await db.disconnectAndClear();

  return results;
}

/**
 * Run a specific subset of tests
 */
async function runCustomBenchmark(testNumbers: number[], seed = 42): Promise<void> {
  const db = await initDatabase();

  console.log(`🎯 Running custom benchmark suite: Tests ${testNumbers.join(', ')}`);

  for (const testNum of testNumbers) {
    await runBenchmark(db, testNum, seed);
  }

  await db.disconnectAndClear();
}

/**
 * Compare same test with different seeds
 */
async function compareSeedVariation(testNumber: number, seeds: number[]): Promise<void> {
  const db = await initDatabase();

  console.log(`🔬 Comparing Test ${testNumber} with different seeds`);

  for (const seed of seeds) {
    console.log(`\n  Seed: ${seed}`);
    await runBenchmark(db, testNumber, seed);
  }

  await db.disconnectAndClear();
}

// Example usage (uncomment to run)
// await runAllBenchmarks();
// await runCustomBenchmark([1, 2, 3]); // Run only insert tests
// await compareSeedVariation(1, [42, 100, 200]); // Compare with different seeds

export {
  initDatabase,
  runBenchmark,
  runAllBenchmarks,
  runCustomBenchmark,
  compareSeedVariation,
  type BenchmarkResult
};

