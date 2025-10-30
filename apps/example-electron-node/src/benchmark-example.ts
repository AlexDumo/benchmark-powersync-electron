/**
 * Example usage of the sql-gen package in the electron-node app
 * This demonstrates how to import and use the benchmark test generators
 */

import { test1, test2, test3, test4, test5, test7, test8, test9, test10, test11, test12, test13, test14, test15, test16 } from 'sql-gen';
import type Database from 'better-sqlite3';

// Example: Generate SQL for Test 1 (1000 INSERTs)
export function runTest1Example() {
    const result = test1(42); // Use seed 42 for reproducible results
    console.log('Test Description:', result.testDescription);
    console.log('Number of SQL statements:', result.sqlStatements.length);
    console.log('First statement:', result.sqlStatements[0]);
    return result;
}

// Example: Generate all benchmark tests
export function generateAllBenchmarks(seed = 42) {
    return {
        test1: test1(seed),
        test2: test2(seed),
        test3: test3(seed),
        test4: test4(seed),
        test5: test5(seed),
        test7: test7(seed),
        test8: test8(seed),
        test9: test9(seed),
        test10: test10(seed),
        test11: test11(seed),
        test12: test12(seed),
        test13: test13(seed),
        test14: test14(seed),
        test15: test15(seed),
        test16: test16(seed),
    };
}

// Example: Execute a benchmark test using better-sqlite3
export function executeBenchmarkTest(
    db: Database.Database,
    testFunction: (seed?: number) => { testDescription: string; sqlStatements: string[] },
    seed = 42
) {
    const { testDescription, sqlStatements } = testFunction(seed);

    console.log(`Starting: ${testDescription}`);
    const startTime = performance.now();

    for (const statement of sqlStatements) {
        // Skip SELECT statements in this simple example
        if (!statement.trim().startsWith('SELECT')) {
            db.exec(statement);
        }
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    console.log(`Completed: ${testDescription} in ${duration.toFixed(2)}ms`);

    return {
        testDescription,
        duration,
        statementsExecuted: sqlStatements.length,
    };
}

// Example: Run all benchmarks
export function runAllBenchmarks(db: Database.Database, seed = 42) {
    const tests = [
        test1, test2, test3, test4, test5, test7, test8, test9,
        test10, test11, test12, test13, test14, test15, test16
    ];

    const results = [];

    for (const testFunc of tests) {
        const result = executeBenchmarkTest(db, testFunc, seed);
        results.push(result);
    }

    return results;
}

