import { column, Schema, Table } from '@powersync/common';

// Standard benchmark table structure with 3 columns
// PowerSync will automatically add an 'id' column as the primary key
const benchmarkTable = new Table({
  a: column.integer,
  b: column.integer,
  c: column.text
});

// Create all test tables (t1-t16, skipping t6 which doesn't exist in the tests)
const t1 = new Table({
  a: column.integer,
  b: column.integer,
  c: column.text
});

const t2 = new Table({
  a: column.integer,
  b: column.integer,
  c: column.text
});

const t3 = new Table({
  a: column.integer,
  b: column.integer,
  c: column.text
});

const t4 = new Table({
  a: column.integer,
  b: column.integer,
  c: column.text
});

const t5 = new Table({
  a: column.integer,
  b: column.integer,
  c: column.text
});

const t7 = new Table({
  a: column.integer,
  b: column.integer,
  c: column.text
});

const t8 = new Table({
  a: column.integer,
  b: column.integer,
  c: column.text
});

const t9 = new Table({
  a: column.integer,
  b: column.integer,
  c: column.text
});

const t10 = new Table({
  a: column.integer,
  b: column.integer,
  c: column.text
});

const t11 = new Table({
  a: column.integer,
  b: column.integer,
  c: column.text
});

const t11_source = new Table({
  a: column.integer,
  b: column.integer,
  c: column.text
});

const t12 = new Table({
  a: column.integer,
  b: column.integer,
  c: column.text
});

const t13 = new Table({
  a: column.integer,
  b: column.integer,
  c: column.text
});

const t14 = new Table({
  a: column.integer,
  b: column.integer,
  c: column.text
});

const t15 = new Table({
  a: column.integer,
  b: column.integer,
  c: column.text
});

const t16 = new Table({
  a: column.integer,
  b: column.integer,
  c: column.text
});

// PowerSync Schema for benchmark tests
// Each table will automatically have an 'id' column (UUID) added by PowerSync
export const BenchmarkSchema = new Schema({
  t1,
  t2,
  t3,
  t4,
  t5,
  t7,
  t8,
  t9,
  t10,
  t11,
  t11_source,
  t12,
  t13,
  t14,
  t15,
  t16
});

// Generate TypeScript types from schema
export type BenchmarkDatabase = (typeof BenchmarkSchema)['types'];
export type BenchmarkRecord = BenchmarkDatabase['t1']; // All tables have the same structure

