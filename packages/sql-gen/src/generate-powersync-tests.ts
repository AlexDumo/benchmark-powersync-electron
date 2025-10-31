import { faker } from '@faker-js/faker';

type TestResult = {
    testDescription: string;
    sqlStatements: string[];
};

// Helper to generate a UUID
const generateId = (): string => {
    return faker.string.uuid();
};

// Test 1: 1000 INSERTs
// PowerSync tables automatically have an 'id' column (UUID/TEXT primary key)
export const test1 = (seed = 42): TestResult => {
    faker.seed(seed);
    const statements: string[] = [
        'DELETE FROM t1;' // Clear table instead of DROP/CREATE
    ];

    for (let i = 0; i < 1000; i++) {
        const id = generateId();
        const a = faker.number.int({ min: 1, max: 100000 });
        const b = faker.number.int({ min: 1, max: 100000 });
        const c = faker.string.alphanumeric(100);
        statements.push(`INSERT INTO t1 (id, a, b, c) VALUES('${id}', ${a}, ${b}, '${c}');`);
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
        'DELETE FROM t2;',
        'BEGIN;'
    ];

    for (let i = 0; i < 25000; i++) {
        const id = generateId();
        const a = faker.number.int({ min: 1, max: 100000 });
        const b = faker.number.int({ min: 1, max: 100000 });
        const c = faker.string.alphanumeric(100);
        statements.push(`INSERT INTO t2 (id, a, b, c) VALUES('${id}', ${a}, ${b}, '${c}');`);
    }

    statements.push('COMMIT;');

    return {
        testDescription: 'Test 2: 25000 INSERTs in a transaction',
        sqlStatements: statements
    };
};

// Test 4: 100 SELECTs without an index
export const test4 = (seed = 42): TestResult => {
    faker.seed(seed);
    const statements: string[] = [
        'DELETE FROM t4;',
        'BEGIN;'
    ];

    // First populate the table
    for (let i = 0; i < 25000; i++) {
        const id = generateId();
        const a = faker.number.int({ min: 1, max: 100000 });
        const b = faker.number.int({ min: 1, max: 100000 });
        const c = faker.string.alphanumeric(100);
        statements.push(`INSERT INTO t4 (id, a, b, c) VALUES('${id}', ${a}, ${b}, '${c}');`);
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
        'DELETE FROM t5;',
        'BEGIN;'
    ];

    // Populate the table
    for (let i = 0; i < 25000; i++) {
        const id = generateId();
        const a = faker.number.int({ min: 1, max: 100000 });
        const b = faker.number.int({ min: 1, max: 100000 });
        const c = faker.string.alphanumeric(100);
        statements.push(`INSERT INTO t5 (id, a, b, c) VALUES('${id}', ${a}, ${b}, '${c}');`);
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

// Test 7: 5000 SELECTs using primary key
export const test7 = (seed = 42): TestResult => {
    faker.seed(seed);
    const statements: string[] = [
        'DELETE FROM t7;',
        'BEGIN;'
    ];

    // Store IDs for later queries
    const ids: string[] = [];

    // Populate the table
    for (let i = 0; i < 25000; i++) {
        const id = generateId();
        ids.push(id);
        const a = faker.number.int({ min: 1, max: 100000 });
        const b = faker.number.int({ min: 1, max: 100000 });
        const c = faker.string.alphanumeric(100);
        statements.push(`INSERT INTO t7 (id, a, b, c) VALUES('${id}', ${a}, ${b}, '${c}');`);
    }

    statements.push('COMMIT;');

    // Now do 5000 SELECTs using primary key
    for (let i = 0; i < 5000; i++) {
        const randomId = ids[faker.number.int({ min: 0, max: ids.length - 1 })];
        statements.push(`SELECT count(*), avg(b) FROM t7 WHERE id='${randomId}';`);
    }

    return {
        testDescription: 'Test 7: 5000 SELECTs using primary key',
        sqlStatements: statements
    };
};

// Test 8: 1000 UPDATEs without an index
export const test8 = (seed = 42): TestResult => {
    faker.seed(seed);
    const statements: string[] = [
        'DELETE FROM t8;',
        'BEGIN;'
    ];

    // Populate the table
    for (let i = 0; i < 25000; i++) {
        const id = generateId();
        const a = faker.number.int({ min: 1, max: 100000 });
        const b = faker.number.int({ min: 1, max: 100000 });
        const c = faker.string.alphanumeric(100);
        statements.push(`INSERT INTO t8 (id, a, b, c) VALUES('${id}', ${a}, ${b}, '${c}');`);
    }

    statements.push('COMMIT;');

    // Now do 1000 UPDATEs
    for (let i = 0; i < 1000; i++) {
        const oldValue = faker.number.int({ min: 1, max: 100000 });
        statements.push(`UPDATE t8 SET b=b*2 WHERE a=${oldValue};`);
    }

    return {
        testDescription: 'Test 8: 1000 UPDATEs without an index',
        sqlStatements: statements
    };
};

// Test 9: 25000 UPDATEs using primary key
export const test9 = (seed = 42): TestResult => {
    faker.seed(seed);
    const statements: string[] = [
        'DELETE FROM t9;',
        'BEGIN;'
    ];

    // Store IDs for later updates
    const ids: string[] = [];

    // Populate the table with UUIDs
    for (let i = 0; i < 25000; i++) {
        const id = generateId();
        ids.push(id);
        const a = i + 1;
        const b = faker.number.int({ min: 1, max: 100000 });
        const c = faker.string.alphanumeric(100);
        statements.push(`INSERT INTO t9 (id, a, b, c) VALUES('${id}', ${a}, ${b}, '${c}');`);
    }

    statements.push('COMMIT;');
    statements.push('BEGIN;');

    // Now do 25000 UPDATEs using the primary key
    for (let i = 0; i < 25000; i++) {
        statements.push(`UPDATE t9 SET b=b+1 WHERE id='${ids[i]}';`);
    }

    statements.push('COMMIT;');

    return {
        testDescription: 'Test 9: 25000 UPDATEs using primary key',
        sqlStatements: statements
    };
};

// Test 10: 25000 text UPDATEs using primary key
export const test10 = (seed = 42): TestResult => {
    faker.seed(seed);
    const statements: string[] = [
        'DELETE FROM t10;',
        'BEGIN;'
    ];

    // Store IDs for later updates
    const ids: string[] = [];

    // Populate the table
    for (let i = 0; i < 25000; i++) {
        const id = generateId();
        ids.push(id);
        const a = i + 1;
        const b = faker.number.int({ min: 1, max: 100000 });
        const c = faker.string.alphanumeric(100);
        statements.push(`INSERT INTO t10 (id, a, b, c) VALUES('${id}', ${a}, ${b}, '${c}');`);
    }

    statements.push('COMMIT;');
    statements.push('BEGIN;');

    // Now do 25000 text UPDATEs using primary key
    for (let i = 0; i < 25000; i++) {
        const newText = faker.string.alphanumeric(100);
        statements.push(`UPDATE t10 SET c='${newText}' WHERE id='${ids[i]}';`);
    }

    statements.push('COMMIT;');

    return {
        testDescription: 'Test 10: 25000 text UPDATEs using primary key',
        sqlStatements: statements
    };
};

// Test 11: INSERTs from a SELECT
export const test11 = (seed = 42): TestResult => {
    faker.seed(seed);
    const statements: string[] = [
        'DELETE FROM t11;',
        'DELETE FROM t11_source;',
        'BEGIN;'
    ];

    // Populate source table
    for (let i = 0; i < 25000; i++) {
        const id = generateId();
        const a = faker.number.int({ min: 1, max: 100000 });
        const b = faker.number.int({ min: 1, max: 100000 });
        const c = faker.string.alphanumeric(100);
        statements.push(`INSERT INTO t11_source (id, a, b, c) VALUES('${id}', ${a}, ${b}, '${c}');`);
    }

    statements.push('COMMIT;');

    // Insert from SELECT - PowerSync tables need explicit id column
    statements.push('INSERT INTO t11 (id, a, b, c) SELECT id, a, b, c FROM t11_source;');

    return {
        testDescription: 'Test 11: INSERTs from a SELECT',
        sqlStatements: statements
    };
};

// Test 12: DELETE without an index
export const test12 = (seed = 42): TestResult => {
    faker.seed(seed);
    const statements: string[] = [
        'DELETE FROM t12;',
        'BEGIN;'
    ];

    // Populate the table
    for (let i = 0; i < 25000; i++) {
        const id = generateId();
        const a = faker.number.int({ min: 1, max: 100000 });
        const b = faker.number.int({ min: 1, max: 100000 });
        const c = faker.string.alphanumeric(100);
        statements.push(`INSERT INTO t12 (id, a, b, c) VALUES('${id}', ${a}, ${b}, '${c}');`);
    }

    statements.push('COMMIT;');

    // Delete some rows
    statements.push('DELETE FROM t12 WHERE a < 50000;');

    return {
        testDescription: 'Test 12: DELETE without an index',
        sqlStatements: statements
    };
};

// Test 13: DELETE using primary key
export const test13 = (seed = 42): TestResult => {
    faker.seed(seed);
    const statements: string[] = [
        'DELETE FROM t13;',
        'BEGIN;'
    ];

    // Collect IDs where a < 50000 for deletion
    const idsToDelete: string[] = [];

    // Populate the table
    for (let i = 0; i < 25000; i++) {
        const id = generateId();
        const a = faker.number.int({ min: 1, max: 100000 });
        const b = faker.number.int({ min: 1, max: 100000 });
        const c = faker.string.alphanumeric(100);

        if (a < 50000) {
            idsToDelete.push(id);
        }

        statements.push(`INSERT INTO t13 (id, a, b, c) VALUES('${id}', ${a}, ${b}, '${c}');`);
    }

    statements.push('COMMIT;');

    // Delete rows using primary key - split into batches to avoid SQL statement length limits
    const batchSize = 500;
    for (let i = 0; i < idsToDelete.length; i += batchSize) {
        const batch = idsToDelete.slice(i, i + batchSize);
        const idList = batch.map(id => `'${id}'`).join(',');
        statements.push(`DELETE FROM t13 WHERE id IN (${idList});`);
    }

    return {
        testDescription: 'Test 13: DELETE using primary key',
        sqlStatements: statements
    };
};

// Test 14: A big INSERT after a big DELETE
export const test14 = (seed = 42): TestResult => {
    faker.seed(seed);
    const statements: string[] = [
        'DELETE FROM t14;',
        'BEGIN;'
    ];

    // Populate the table
    for (let i = 0; i < 25000; i++) {
        const id = generateId();
        const a = faker.number.int({ min: 1, max: 100000 });
        const b = faker.number.int({ min: 1, max: 100000 });
        const c = faker.string.alphanumeric(100);
        statements.push(`INSERT INTO t14 (id, a, b, c) VALUES('${id}', ${a}, ${b}, '${c}');`);
    }

    statements.push('COMMIT;');

    // Big DELETE
    statements.push('DELETE FROM t14;');

    // Big INSERT
    statements.push('BEGIN;');
    for (let i = 0; i < 25000; i++) {
        const id = generateId();
        const a = faker.number.int({ min: 1, max: 100000 });
        const b = faker.number.int({ min: 1, max: 100000 });
        const c = faker.string.alphanumeric(100);
        statements.push(`INSERT INTO t14 (id, a, b, c) VALUES('${id}', ${a}, ${b}, '${c}');`);
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
        'DELETE FROM t15;',
        'BEGIN;'
    ];

    // Populate the table
    for (let i = 0; i < 25000; i++) {
        const id = generateId();
        const a = faker.number.int({ min: 1, max: 100000 });
        const b = faker.number.int({ min: 1, max: 100000 });
        const c = faker.string.alphanumeric(100);
        statements.push(`INSERT INTO t15 (id, a, b, c) VALUES('${id}', ${a}, ${b}, '${c}');`);
    }

    statements.push('COMMIT;');

    // Big DELETE
    statements.push('DELETE FROM t15;');

    // Many small INSERTs (not in a transaction)
    for (let i = 0; i < 12000; i++) {
        const id = generateId();
        const a = faker.number.int({ min: 1, max: 100000 });
        const b = faker.number.int({ min: 1, max: 100000 });
        const c = faker.string.alphanumeric(100);
        statements.push(`INSERT INTO t15 (id, a, b, c) VALUES('${id}', ${a}, ${b}, '${c}');`);
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
        'DELETE FROM t16;',
        'BEGIN;'
    ];

    // Populate the table
    for (let i = 0; i < 25000; i++) {
        const id = generateId();
        const a = faker.number.int({ min: 1, max: 100000 });
        const b = faker.number.int({ min: 1, max: 100000 });
        const c = faker.string.alphanumeric(100);
        statements.push(`INSERT INTO t16 (id, a, b, c) VALUES('${id}', ${a}, ${b}, '${c}');`);
    }

    statements.push('COMMIT;');

    // Clear the table
    statements.push('DELETE FROM t16;');

    return {
        testDescription: 'Test 16: Clear table',
        sqlStatements: statements
    };
};

