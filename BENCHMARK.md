# Benchmarking renderer vs NodeJS

## The benchmark

\*\*### Control - Query performance with the raw driver (better-sqlite3 vs wa-sqlite)

Test 1: 1000 INSERTs
Test 2: 25000 INSERTs in a transaction
Test 3: 25000 INSERTs into an indexed table
Test 4: 100 SELECTs without an index
Test 5: 100 SELECTs on a string comparison
Test 7: 5000 SELECTs with an index
Test 8: 1000 UPDATEs without an index
Test 9: 25000 UPDATEs with an index
Test 10: 25000 text UPDATEs with an index
Test 11: INSERTs from a SELECT
Test 12: DELETE without an index
Test 13: DELETE with an index
Test 14: A big INSERT after a big DELETE
Test 15: A big DELETE followed by many small INSERTs
Test 16: Clear table\*\*

### Query performance in PowerSync
