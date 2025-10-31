#!/usr/bin/env node

import { createPowerSyncDatabase } from "../powersync/PowerSyncSetup.js";
import { BenchmarkRunner } from "../benchmark-runner.js";

async function main() {
  console.log('PowerSync Node Benchmark App');
  console.log('Using better-sqlite3 (native SQLite)');
  console.log('');

  try {
    // Initialize PowerSync
    console.log('Initializing PowerSync...');
    const db = await createPowerSyncDatabase();

    // Wait a moment for connection to stabilize
    await new Promise(resolve => setTimeout(resolve, 2000));

    const runner = new BenchmarkRunner(db);

    // Parse command line arguments
    const args = process.argv.slice(2);
    const command = args[0] || 'all';

    let results;

    switch (command) {
      case 'quick':
        results = await runner.runQuickTests();
        break;
      case 'all':
      default:
        results = await runner.runAllBenchmarks();
        break;
    }

    // Export results
    runner.exportResults(results);

    // Disconnect
    await db.disconnectAndClear();
    console.log('\n✅ Benchmark completed successfully');
    process.exit(0);

  } catch (error) {
    console.error('Error running benchmarks:', error);
    process.exit(1);
  }
}

main();

