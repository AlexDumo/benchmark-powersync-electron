import { faker } from '@faker-js/faker';

type TestResult = {
    testDescription: string;
    sqlStatements: string[];
};

// Test 1: 1000 INSERTs
export const test1 = (seed = 42): TestResult => {
    faker.seed(seed);
    const statements: string[] = [
        'DROP TABLE IF EXISTS t1;',
        'CREATE TABLE t1(a INTEGER, b INTEGER, c TEXT);'
    ];

    for (let i = 0; i < 1000; i++) {
        const a = faker.number.int({ min: 1, max: 100000 });
        const b = faker.number.int({ min: 1, max: 100000 });
        const c = faker.string.alphanumeric(100);
        statements.push(`INSERT INTO t1 VALUES(${a}, ${b}, '${c}');`);
    }

    return {
        testDescription: 'Test 1: 1000 INSERTs',
        sqlStatements: statements
    };
};

// Test 2: 25000 INSERTs in a transaction
export const test2 = (seed = 42): TestResult => {
    faker.seed(seed);
    const statements: string[] = [
        'DROP TABLE IF EXISTS t2;',
        'CREATE TABLE t2(a INTEGER, b INTEGER, c TEXT);',
        'BEGIN;'
    ];

    for (let i = 0; i < 25000; i++) {
        const a = faker.number.int({ min: 1, max: 100000 });
        const b = faker.number.int({ min: 1, max: 100000 });
        const c = faker.string.alphanumeric(100);
        statements.push(`INSERT INTO t2 VALUES(${a}, ${b}, '${c}');`);
    }

    statements.push('COMMIT;');

    return {
        testDescription: 'Test 2: 25000 INSERTs in a transaction',
        sqlStatements: statements
    };
};

// Test 3: 25000 INSERTs into an indexed table
export const test3 = (seed = 42): TestResult => {
    faker.seed(seed);
    const statements: string[] = [
        'DROP TABLE IF EXISTS t3;',
        'CREATE TABLE t3(a INTEGER, b INTEGER, c TEXT);',
        'CREATE INDEX i3a ON t3(a);',
        'CREATE INDEX i3b ON t3(b);',
        'BEGIN;'
    ];

    for (let i = 0; i < 25000; i++) {
        const a = faker.number.int({ min: 1, max: 100000 });
        const b = faker.number.int({ min: 1, max: 100000 });
        const c = faker.string.alphanumeric(100);
        statements.push(`INSERT INTO t3 VALUES(${a}, ${b}, '${c}');`);
    }

    statements.push('COMMIT;');

    return {
        testDescription: 'Test 3: 25000 INSERTs into an indexed table',
        sqlStatements: statements
    };
};

// Test 4: 100 SELECTs without an index
export const test4 = (seed = 42): TestResult => {
    faker.seed(seed);
    const statements: string[] = [
        'DROP TABLE IF EXISTS t4;',
        'CREATE TABLE t4(a INTEGER, b INTEGER, c TEXT);',
        'BEGIN;'
    ];

    // First populate the table
    for (let i = 0; i < 25000; i++) {
        const a = faker.number.int({ min: 1, max: 100000 });
        const b = faker.number.int({ min: 1, max: 100000 });
        const c = faker.string.alphanumeric(100);
        statements.push(`INSERT INTO t4 VALUES(${a}, ${b}, '${c}');`);
    }

    statements.push('COMMIT;');

    // Now do 100 SELECTs
    for (let i = 0; i < 100; i++) {
        const value = faker.number.int({ min: 1, max: 100000 });
        statements.push(`SELECT count(*), avg(b) FROM t4 WHERE a=${value};`);
    }

    return {
        testDescription: 'Test 4: 100 SELECTs without an index',
        sqlStatements: statements
    };
};

// Test 5: 100 SELECTs on a string comparison
export const test5 = (seed = 42): TestResult => {
    faker.seed(seed);
    const statements: string[] = [
        'DROP TABLE IF EXISTS t5;',
        'CREATE TABLE t5(a INTEGER, b INTEGER, c TEXT);',
        'BEGIN;'
    ];

    // Populate the table
    for (let i = 0; i < 25000; i++) {
        const a = faker.number.int({ min: 1, max: 100000 });
        const b = faker.number.int({ min: 1, max: 100000 });
        const c = faker.string.alphanumeric(100);
        statements.push(`INSERT INTO t5 VALUES(${a}, ${b}, '${c}');`);
    }

    statements.push('COMMIT;');

    // Now do 100 SELECTs with string comparison
    for (let i = 0; i < 100; i++) {
        const pattern = faker.string.alphanumeric(10);
        statements.push(`SELECT count(*), avg(b) FROM t5 WHERE c LIKE '%${pattern}%';`);
    }

    return {
        testDescription: 'Test 5: 100 SELECTs on a string comparison',
        sqlStatements: statements
    };
};

// Test 7: 5000 SELECTs with an index
export const test7 = (seed = 42): TestResult => {
    faker.seed(seed);
    const statements: string[] = [
        'DROP TABLE IF EXISTS t7;',
        'CREATE TABLE t7(a INTEGER, b INTEGER, c TEXT);',
        'BEGIN;'
    ];

    // Populate the table
    for (let i = 0; i < 25000; i++) {
        const a = faker.number.int({ min: 1, max: 100000 });
        const b = faker.number.int({ min: 1, max: 100000 });
        const c = faker.string.alphanumeric(100);
        statements.push(`INSERT INTO t7 VALUES(${a}, ${b}, '${c}');`);
    }

    statements.push('COMMIT;');
    statements.push('CREATE INDEX i7 ON t7(a);');

    // Now do 5000 SELECTs with index
    for (let i = 0; i < 5000; i++) {
        const value = faker.number.int({ min: 1, max: 100000 });
        statements.push(`SELECT count(*), avg(b) FROM t7 WHERE a=${value};`);
    }

    return {
        testDescription: 'Test 7: 5000 SELECTs with an index',
        sqlStatements: statements
    };
};

// Test 8: 1000 UPDATEs without an index
export const test8 = (seed = 42): TestResult => {
    faker.seed(seed);
    const statements: string[] = [
        'DROP TABLE IF EXISTS t8;',
        'CREATE TABLE t8(a INTEGER, b INTEGER, c TEXT);',
        'BEGIN;'
    ];

    // Populate the table
    for (let i = 0; i < 25000; i++) {
        const a = faker.number.int({ min: 1, max: 100000 });
        const b = faker.number.int({ min: 1, max: 100000 });
        const c = faker.string.alphanumeric(100);
        statements.push(`INSERT INTO t8 VALUES(${a}, ${b}, '${c}');`);
    }

    statements.push('COMMIT;');

    // Now do 1000 UPDATEs
    for (let i = 0; i < 1000; i++) {
        const oldValue = faker.number.int({ min: 1, max: 100000 });
        const newValue = faker.number.int({ min: 1, max: 100000 });
        statements.push(`UPDATE t8 SET b=b*2 WHERE a=${oldValue};`);
    }

    return {
        testDescription: 'Test 8: 1000 UPDATEs without an index',
        sqlStatements: statements
    };
};

// Test 9: 25000 UPDATEs with an index
export const test9 = (seed = 42): TestResult => {
    faker.seed(seed);
    const statements: string[] = [
        'DROP TABLE IF EXISTS t9;',
        'CREATE TABLE t9(a INTEGER, b INTEGER, c TEXT);',
        'BEGIN;'
    ];

    // Populate the table with sequential IDs for easier updates
    for (let i = 0; i < 25000; i++) {
        const a = i + 1;
        const b = faker.number.int({ min: 1, max: 100000 });
        const c = faker.string.alphanumeric(100);
        statements.push(`INSERT INTO t9 VALUES(${a}, ${b}, '${c}');`);
    }

    statements.push('COMMIT;');
    statements.push('CREATE INDEX i9 ON t9(a);');
    statements.push('BEGIN;');

    // Now do 25000 UPDATEs
    for (let i = 0; i < 25000; i++) {
        const id = i + 1;
        statements.push(`UPDATE t9 SET b=b+1 WHERE a=${id};`);
    }

    statements.push('COMMIT;');

    return {
        testDescription: 'Test 9: 25000 UPDATEs with an index',
        sqlStatements: statements
    };
};

// Test 10: 25000 text UPDATEs with an index
export const test10 = (seed = 42): TestResult => {
    faker.seed(seed);
    const statements: string[] = [
        'DROP TABLE IF EXISTS t10;',
        'CREATE TABLE t10(a INTEGER, b INTEGER, c TEXT);',
        'BEGIN;'
    ];

    // Populate the table
    for (let i = 0; i < 25000; i++) {
        const a = i + 1;
        const b = faker.number.int({ min: 1, max: 100000 });
        const c = faker.string.alphanumeric(100);
        statements.push(`INSERT INTO t10 VALUES(${a}, ${b}, '${c}');`);
    }

    statements.push('COMMIT;');
    statements.push('CREATE INDEX i10 ON t10(a);');
    statements.push('BEGIN;');

    // Now do 25000 text UPDATEs
    for (let i = 0; i < 25000; i++) {
        const id = i + 1;
        const newText = faker.string.alphanumeric(100);
        statements.push(`UPDATE t10 SET c='${newText}' WHERE a=${id};`);
    }

    statements.push('COMMIT;');

    return {
        testDescription: 'Test 10: 25000 text UPDATEs with an index',
        sqlStatements: statements
    };
};

// Test 11: INSERTs from a SELECT
export const test11 = (seed = 42): TestResult => {
    faker.seed(seed);
    const statements: string[] = [
        'DROP TABLE IF EXISTS t11;',
        'DROP TABLE IF EXISTS t11_source;',
        'CREATE TABLE t11(a INTEGER, b INTEGER, c TEXT);',
        'CREATE TABLE t11_source(a INTEGER, b INTEGER, c TEXT);',
        'BEGIN;'
    ];

    // Populate source table
    for (let i = 0; i < 25000; i++) {
        const a = faker.number.int({ min: 1, max: 100000 });
        const b = faker.number.int({ min: 1, max: 100000 });
        const c = faker.string.alphanumeric(100);
        statements.push(`INSERT INTO t11_source VALUES(${a}, ${b}, '${c}');`);
    }

    statements.push('COMMIT;');

    // Insert from SELECT
    statements.push('INSERT INTO t11 SELECT * FROM t11_source;');

    return {
        testDescription: 'Test 11: INSERTs from a SELECT',
        sqlStatements: statements
    };
};

// Test 12: DELETE without an index
export const test12 = (seed = 42): TestResult => {
    faker.seed(seed);
    const statements: string[] = [
        'DROP TABLE IF EXISTS t12;',
        'CREATE TABLE t12(a INTEGER, b INTEGER, c TEXT);',
        'BEGIN;'
    ];

    // Populate the table
    for (let i = 0; i < 25000; i++) {
        const a = faker.number.int({ min: 1, max: 100000 });
        const b = faker.number.int({ min: 1, max: 100000 });
        const c = faker.string.alphanumeric(100);
        statements.push(`INSERT INTO t12 VALUES(${a}, ${b}, '${c}');`);
    }

    statements.push('COMMIT;');

    // Delete some rows
    statements.push('DELETE FROM t12 WHERE a < 50000;');

    return {
        testDescription: 'Test 12: DELETE without an index',
        sqlStatements: statements
    };
};

// Test 13: DELETE with an index
export const test13 = (seed = 42): TestResult => {
    faker.seed(seed);
    const statements: string[] = [
        'DROP TABLE IF EXISTS t13;',
        'CREATE TABLE t13(a INTEGER, b INTEGER, c TEXT);',
        'BEGIN;'
    ];

    // Populate the table
    for (let i = 0; i < 25000; i++) {
        const a = faker.number.int({ min: 1, max: 100000 });
        const b = faker.number.int({ min: 1, max: 100000 });
        const c = faker.string.alphanumeric(100);
        statements.push(`INSERT INTO t13 VALUES(${a}, ${b}, '${c}');`);
    }

    statements.push('COMMIT;');
    statements.push('CREATE INDEX i13 ON t13(a);');

    // Delete some rows
    statements.push('DELETE FROM t13 WHERE a < 50000;');

    return {
        testDescription: 'Test 13: DELETE with an index',
        sqlStatements: statements
    };
};

// Test 14: A big INSERT after a big DELETE
export const test14 = (seed = 42): TestResult => {
    faker.seed(seed);
    const statements: string[] = [
        'DROP TABLE IF EXISTS t14;',
        'CREATE TABLE t14(a INTEGER, b INTEGER, c TEXT);',
        'BEGIN;'
    ];

    // Populate the table
    for (let i = 0; i < 25000; i++) {
        const a = faker.number.int({ min: 1, max: 100000 });
        const b = faker.number.int({ min: 1, max: 100000 });
        const c = faker.string.alphanumeric(100);
        statements.push(`INSERT INTO t14 VALUES(${a}, ${b}, '${c}');`);
    }

    statements.push('COMMIT;');

    // Big DELETE
    statements.push('DELETE FROM t14;');

    // Big INSERT
    statements.push('BEGIN;');
    for (let i = 0; i < 25000; i++) {
        const a = faker.number.int({ min: 1, max: 100000 });
        const b = faker.number.int({ min: 1, max: 100000 });
        const c = faker.string.alphanumeric(100);
        statements.push(`INSERT INTO t14 VALUES(${a}, ${b}, '${c}');`);
    }
    statements.push('COMMIT;');

    return {
        testDescription: 'Test 14: A big INSERT after a big DELETE',
        sqlStatements: statements
    };
};

// Test 15: A big DELETE followed by many small INSERTs
export const test15 = (seed = 42): TestResult => {
    faker.seed(seed);
    const statements: string[] = [
        'DROP TABLE IF EXISTS t15;',
        'CREATE TABLE t15(a INTEGER, b INTEGER, c TEXT);',
        'BEGIN;'
    ];

    // Populate the table
    for (let i = 0; i < 25000; i++) {
        const a = faker.number.int({ min: 1, max: 100000 });
        const b = faker.number.int({ min: 1, max: 100000 });
        const c = faker.string.alphanumeric(100);
        statements.push(`INSERT INTO t15 VALUES(${a}, ${b}, '${c}');`);
    }

    statements.push('COMMIT;');

    // Big DELETE
    statements.push('DELETE FROM t15;');

    // Many small INSERTs (not in a transaction)
    for (let i = 0; i < 12000; i++) {
        const a = faker.number.int({ min: 1, max: 100000 });
        const b = faker.number.int({ min: 1, max: 100000 });
        const c = faker.string.alphanumeric(100);
        statements.push(`INSERT INTO t15 VALUES(${a}, ${b}, '${c}');`);
    }

    return {
        testDescription: 'Test 15: A big DELETE followed by many small INSERTs',
        sqlStatements: statements
    };
};

// Test 16: Clear table
export const test16 = (seed = 42): TestResult => {
    faker.seed(seed);
    const statements: string[] = [
        'DROP TABLE IF EXISTS t16;',
        'CREATE TABLE t16(a INTEGER, b INTEGER, c TEXT);',
        'BEGIN;'
    ];

    // Populate the table
    for (let i = 0; i < 25000; i++) {
        const a = faker.number.int({ min: 1, max: 100000 });
        const b = faker.number.int({ min: 1, max: 100000 });
        const c = faker.string.alphanumeric(100);
        statements.push(`INSERT INTO t16 VALUES(${a}, ${b}, '${c}');`);
    }

    statements.push('COMMIT;');

    // Clear the table
    statements.push('DELETE FROM t16;');

    return {
        testDescription: 'Test 16: Clear table',
        sqlStatements: statements
    };
};
