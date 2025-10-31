import { PowerSyncDatabase } from "@powersync/node";
import { PowerSyncTests } from "sql-gen";
import * as fs from 'fs';

export interface BenchmarkResult {
  testNumber: number;
  testDescription: string;
  duration: number;
  statementsExecuted: number;
}

export class BenchmarkRunner {
  private db: PowerSyncDatabase;
  private allTestNumbers = [1, 2, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

  constructor(db: PowerSyncDatabase) {
    this.db = db;
  }

  async runSingleTest(testNum: number, seed = 42): Promise<BenchmarkResult> {
    const testKey = `test${testNum}` as keyof typeof PowerSyncTests;
    const testFn = PowerSyncTests[testKey];

    if (!testFn || typeof testFn !== 'function') {
      throw new Error(`Test ${testNum} not found`);
    }

    const { testDescription, sqlStatements } = testFn(seed);

    console.log(`\n📊 Running: ${testDescription}`);
    console.log(`   Statements: ${sqlStatements.length}`);

    const startTime = performance.now();

    for (const sql of sqlStatements) {
      await this.db.execute(sql);
    }

    const duration = (performance.now() - startTime) / 1000;

    console.log(`   ✅ Completed in ${duration.toFixed(2)}s`);

    return {
      testNumber: testNum,
      testDescription,
      duration,
      statementsExecuted: sqlStatements.length
    };
  }

  async runAllBenchmarks(seed = 42): Promise<BenchmarkResult[]> {
    console.log('\n🚀 Starting PowerSync Node Benchmark Suite');
    console.log('='.repeat(60));
    console.log(`Engine: better-sqlite3 (native)`);
    console.log(`PowerSync SDK Version: ${this.db.sdkVersion}`);
    console.log('='.repeat(60));

    const results: BenchmarkResult[] = [];

    for (const testNum of this.allTestNumbers) {
      try {
        const result = await this.runSingleTest(testNum, seed);
        results.push(result);
      } catch (error) {
        console.error(`❌ Error running test ${testNum}:`, error);
      }
    }

    this.printSummary(results);

    return results;
  }

  async runQuickTests(seed = 42): Promise<BenchmarkResult[]> {
    console.log('\n🎯 Running Quick Tests (1, 2, 4)');
    console.log('='.repeat(60));

    const quickTests = [1, 2, 4];
    const results: BenchmarkResult[] = [];

    for (const testNum of quickTests) {
      try {
        const result = await this.runSingleTest(testNum, seed);
        results.push(result);
      } catch (error) {
        console.error(`❌ Error running test ${testNum}:`, error);
      }
    }

    this.printSummary(results);

    return results;
  }

  private printSummary(results: BenchmarkResult[]) {
    const totalTime = results.reduce((sum, r) => sum + r.duration, 0);
    const totalStatements = results.reduce((sum, r) => sum + r.statementsExecuted, 0);
    const averageTime = results.length > 0 ? totalTime / results.length : 0;

    console.log('\n📈 Benchmark Summary');
    console.log('='.repeat(60));
    console.log(`Total tests: ${results.length}`);
    console.log(`Total time: ${totalTime.toFixed(2)}s`);
    console.log(`Total statements: ${totalStatements}`);
    console.log(`Average time per test: ${averageTime.toFixed(2)}s`);

    console.log('\nDetailed Results:');
    console.log('-'.repeat(60));
    results.forEach(r => {
      console.log(`  Test ${r.testNumber}: ${r.duration.toFixed(2).padStart(10)}s - ${r.testDescription}`);
    });
    console.log('='.repeat(60));
  }

  exportResults(results: BenchmarkResult[], filename?: string) {
    const defaultFilename = `benchmark-node-results-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const outputFile = filename || defaultFilename;

    const data = {
      timestamp: new Date().toISOString(),
      engine: 'better-sqlite3',
      sdkVersion: this.db.sdkVersion,
      results
    };

    fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));
    console.log(`\n📁 Results exported to: ${outputFile}`);
  }
}

