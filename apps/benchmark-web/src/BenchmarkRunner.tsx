import { useState } from "react";
import { usePowerSync, useStatus } from "@powersync/react";
import { PowerSyncTests } from "sql-gen";

interface BenchmarkResult {
  testNumber: number;
  testDescription: string;
  duration: number;
  statementsExecuted: number;
}

export default function BenchmarkRunner() {
  const powerSync = usePowerSync();
  const status = useStatus();
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [currentTest, setCurrentTest] = useState<string | null>(null);

  const allTestNumbers = [1, 2, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

  const runSingleTest = async (testNum: number, seed = 42) => {
    const testKey = `test${testNum}` as keyof typeof PowerSyncTests;
    const testFn = PowerSyncTests[testKey];

    if (!testFn || typeof testFn !== 'function') {
      throw new Error(`Test ${testNum} not found`);
    }

    const { testDescription, sqlStatements } = testFn(seed);

    setCurrentTest(testDescription);
    console.log(`Starting: ${testDescription}`);

    const startTime = performance.now();

    for (const sql of sqlStatements) {
      await powerSync.execute(sql);
    }

    const duration = (performance.now() - startTime) / 1000;

    console.log(`Completed in ${duration.toFixed(2)}s`);

    return {
      testNumber: testNum,
      testDescription,
      duration,
      statementsExecuted: sqlStatements.length
    };
  };

  const runAllBenchmarks = async (seed = 42) => {
    setRunning(true);
    setResults([]);

    const newResults: BenchmarkResult[] = [];

    try {
      for (const testNum of allTestNumbers) {
        const result = await runSingleTest(testNum, seed);
        newResults.push(result);
        setResults([...newResults]);
      }
    } catch (error) {
      console.error('Benchmark error:', error);
      alert(`Error running benchmarks: ${error}`);
    } finally {
      setRunning(false);
      setCurrentTest(null);
    }
  };

  const runQuickTests = async () => {
    setRunning(true);
    setResults([]);

    const quickTests = [1, 2, 4];
    const newResults: BenchmarkResult[] = [];

    try {
      for (const testNum of quickTests) {
        const result = await runSingleTest(testNum, 42);
        newResults.push(result);
        setResults([...newResults]);
      }
    } catch (error) {
      console.error('Benchmark error:', error);
      alert(`Error running benchmarks: ${error}`);
    } finally {
      setRunning(false);
      setCurrentTest(null);
    }
  };

  const exportResults = () => {
    const dataStr = JSON.stringify(results, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `benchmark-web-results-${new Date().toISOString()}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  const averageDuration = results.length > 0 ? totalDuration / results.length : 0;

  return (
    <div className="benchmark-container">
      <div className="header">
        <h1>PowerSync Web Benchmark</h1>
        <p className="subtitle">Using wa-sqlite (WebAssembly SQLite)</p>
      </div>

      <div className="status-section">
        <h3>Connection Status</h3>
        <div className="status-grid">
          <div>Connected: {status.connected ? '✅' : '❌'}</div>
          <div>Has Synced: {status.hasSynced ? '✅' : '❌'}</div>
          <div>SDK Version: {powerSync.sdkVersion}</div>
        </div>
      </div>

      <div className="controls">
        <button
          onClick={runQuickTests}
          disabled={running}
          className="btn btn-primary"
        >
          {running ? 'Running...' : 'Run Quick Tests (1, 2, 4)'}
        </button>

        <button
          onClick={() => runAllBenchmarks()}
          disabled={running}
          className="btn btn-primary"
        >
          {running ? 'Running...' : 'Run All Benchmarks'}
        </button>

        {results.length > 0 && (
          <button
            onClick={exportResults}
            className="btn btn-secondary"
          >
            Export Results (JSON)
          </button>
        )}
      </div>

      {running && currentTest && (
        <div className="current-test">
          <p>Running: {currentTest}</p>
          <div className="spinner"></div>
        </div>
      )}

      {results.length > 0 && (
        <div className="results-section">
          <h3>Results</h3>

          <div className="summary">
            <div className="summary-item">
              <strong>Total Tests:</strong> {results.length}
            </div>
            <div className="summary-item">
              <strong>Total Time:</strong> {totalDuration.toFixed(2)}s
            </div>
            <div className="summary-item">
              <strong>Average Time:</strong> {averageDuration.toFixed(2)}s
            </div>
          </div>

          <table className="results-table">
            <thead>
              <tr>
                <th>Test #</th>
                <th>Description</th>
                <th>Duration (s)</th>
                <th>Statements</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={result.testNumber}>
                  <td>{result.testNumber}</td>
                  <td>{result.testDescription}</td>
                  <td className="number">{result.duration.toFixed(2)}</td>
                  <td className="number">{result.statementsExecuted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

