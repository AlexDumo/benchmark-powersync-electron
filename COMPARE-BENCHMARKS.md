# Benchmark Comparison Tool

This Go script compares benchmark results between Node and Web implementations.

## Usage

Run the script from the repository root:

```bash
# Output to stdout
go run compare-benchmarks.go

# Output to a file
go run compare-benchmarks.go benchmark-comparison.md
```

Or build and run:

```bash
go build compare-benchmarks.go

# Output to stdout
./compare-benchmarks

# Output to a file
./compare-benchmarks benchmark-comparison.md
```

## Output

The script generates a markdown table comparing:
- Individual test durations (Node vs Web)
- Speedup ratios (how many times faster Node is compared to Web)
- Overall performance summary
- Delta values if multiple benchmark runs exist

## Requirements

- Go 1.16 or higher
- Benchmark result files in:
  - `apps/benchmark-node/results/`
  - `apps/benchmark-web/results/`

## Example Output

The script outputs a markdown-formatted comparison showing:
1. Benchmark metadata (timestamp, engine, SDK version)
2. Per-test comparison table with speedup ratios
3. Summary statistics (total time, overall speedup)

## Features

- Automatically finds the two most recent benchmark files
- Shows delta changes if multiple runs exist
- Calculates speedup ratios (Web duration / Node duration)
- Provides summary statistics

