package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

// NodeResult represents the benchmark result structure for Node
type NodeResult struct {
	Timestamp         string       `json:"timestamp"`
	Engine            string       `json:"engine"`
	SDKVersion        string       `json:"sdkVersion"`
	Results           []TestResult `json:"results"`
}

// TestResult represents a single test result
type TestResult struct {
	TestNumber         int     `json:"testNumber"`
	TestDescription    string  `json:"testDescription"`
	Duration           float64 `json:"duration"`
	StatementsExecuted int     `json:"statementsExecuted"`
}

func main() {
	// Parse command line arguments
	var outputFile string
	if len(os.Args) > 1 {
		outputFile = os.Args[1]
	}

	// Define paths
	nodeResultsDir := "apps/benchmark-node/results"
	webResultsDir := "apps/benchmark-web/results"

	// Get the two most recent files for each benchmark
	nodeFiles, err := getRecentFiles(nodeResultsDir, 2)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error reading node results: %v\n", err)
		os.Exit(1)
	}

	webFiles, err := getRecentFiles(webResultsDir, 2)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error reading web results: %v\n", err)
		os.Exit(1)
	}

	if len(nodeFiles) == 0 {
		fmt.Fprintf(os.Stderr, "No node benchmark results found\n")
		os.Exit(1)
	}

	if len(webFiles) == 0 {
		fmt.Fprintf(os.Stderr, "No web benchmark results found\n")
		os.Exit(1)
	}

	// Read and parse the most recent files
	nodeResults, nodeMetadata, err := readNodeResults(nodeFiles[0])
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error parsing node results: %v\n", err)
		os.Exit(1)
	}

	webResults, webMetadata, err := readWebResults(webFiles[0])
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error parsing web results: %v\n", err)
		os.Exit(1)
	}

	// If there are two files, also read the previous ones
	var prevNodeResults []TestResult
	var prevWebResults []TestResult
	hasPrevNode := len(nodeFiles) > 1
	hasPrevWeb := len(webFiles) > 1

	if hasPrevNode {
		prevNodeResults, _, _ = readNodeResults(nodeFiles[1])
	}

	if hasPrevWeb {
		prevWebResults, _, _ = readWebResults(webFiles[1])
	}

	// Generate markdown output
	output := generateMarkdown(nodeResults, webResults, prevNodeResults, prevWebResults, nodeMetadata, webMetadata, hasPrevNode, hasPrevWeb)

	// Output to file or stdout
	if outputFile != "" {
		err := os.WriteFile(outputFile, []byte(output), 0644)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Error writing to file: %v\n", err)
			os.Exit(1)
		}
		fmt.Fprintf(os.Stderr, "Benchmark comparison written to %s\n", outputFile)
	} else {
		fmt.Print(output)
	}
}

// getRecentFiles returns the most recent N files from a directory, sorted by modification time
func getRecentFiles(dir string, n int) ([]string, error) {
	files, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}

	// Filter JSON files and get their info
	type fileInfo struct {
		path    string
		modTime int64
	}

	var jsonFiles []fileInfo

	for _, file := range files {
		if !file.IsDir() && strings.HasSuffix(file.Name(), ".json") {
			fullPath := filepath.Join(dir, file.Name())
			info, err := os.Stat(fullPath)
			if err != nil {
				continue
			}
			jsonFiles = append(jsonFiles, fileInfo{
				path:    fullPath,
				modTime: info.ModTime().Unix(),
			})
		}
	}

	// Sort by modification time (most recent first)
	sort.Slice(jsonFiles, func(i, j int) bool {
		return jsonFiles[i].modTime > jsonFiles[j].modTime
	})

	// Return up to N most recent files
	result := make([]string, 0, n)
	for i := 0; i < n && i < len(jsonFiles); i++ {
		result = append(result, jsonFiles[i].path)
	}

	return result, nil
}

// readNodeResults reads and parses a Node benchmark results file
func readNodeResults(filepath string) ([]TestResult, map[string]string, error) {
	data, err := os.ReadFile(filepath)
	if err != nil {
		return nil, nil, err
	}

	var nodeResult NodeResult
	if err := json.Unmarshal(data, &nodeResult); err != nil {
		return nil, nil, err
	}

	metadata := map[string]string{
		"timestamp":  nodeResult.Timestamp,
		"engine":     nodeResult.Engine,
		"sdkVersion": nodeResult.SDKVersion,
		"file":       filepath,
	}

	return nodeResult.Results, metadata, nil
}

// readWebResults reads and parses a Web benchmark results file
func readWebResults(filepath string) ([]TestResult, map[string]string, error) {
	data, err := os.ReadFile(filepath)
	if err != nil {
		return nil, nil, err
	}

	var results []TestResult
	if err := json.Unmarshal(data, &results); err != nil {
		return nil, nil, err
	}

	metadata := map[string]string{
		"file": filepath,
	}

	return results, metadata, nil
}

// generateMarkdown creates a markdown comparison table
func generateMarkdown(nodeResults, webResults, prevNodeResults, prevWebResults []TestResult, nodeMetadata, webMetadata map[string]string, hasPrevNode, hasPrevWeb bool) string {
	var sb strings.Builder
	sb.WriteString("# Benchmark Comparison: Node vs Web\n")
	sb.WriteString("\n")

	// Print metadata
	sb.WriteString("## Benchmark Information\n")
	sb.WriteString("\n")
	sb.WriteString("**Node Benchmark:**\n")
	sb.WriteString(fmt.Sprintf("- File: `%s`\n", filepath.Base(nodeMetadata["file"])))
	if timestamp, ok := nodeMetadata["timestamp"]; ok {
		sb.WriteString(fmt.Sprintf("- Timestamp: %s\n", timestamp))
	}
	if engine, ok := nodeMetadata["engine"]; ok {
		sb.WriteString(fmt.Sprintf("- Engine: %s\n", engine))
	}
	if sdk, ok := nodeMetadata["sdkVersion"]; ok {
		sb.WriteString(fmt.Sprintf("- SDK Version: %s\n", sdk))
	}
	sb.WriteString("\n")

	sb.WriteString("**Web Benchmark:**\n")
	sb.WriteString(fmt.Sprintf("- File: `%s`\n", filepath.Base(webMetadata["file"])))
	sb.WriteString("\n")

	// Create maps for quick lookup
	nodeMap := make(map[int]TestResult)
	webMap := make(map[int]TestResult)
	prevNodeMap := make(map[int]TestResult)
	prevWebMap := make(map[int]TestResult)

	for _, r := range nodeResults {
		nodeMap[r.TestNumber] = r
	}
	for _, r := range webResults {
		webMap[r.TestNumber] = r
	}
	for _, r := range prevNodeResults {
		prevNodeMap[r.TestNumber] = r
	}
	for _, r := range prevWebResults {
		prevWebMap[r.TestNumber] = r
	}

	// Get all test numbers
	testNumbers := make(map[int]bool)
	for _, r := range nodeResults {
		testNumbers[r.TestNumber] = true
	}
	for _, r := range webResults {
		testNumbers[r.TestNumber] = true
	}

	// Sort test numbers
	sortedTests := make([]int, 0, len(testNumbers))
	for num := range testNumbers {
		sortedTests = append(sortedTests, num)
	}
	sort.Ints(sortedTests)

	// Print table header
	sb.WriteString("## Results\n")
	sb.WriteString("\n")

	if hasPrevNode || hasPrevWeb {
		sb.WriteString("| Test | Description | Node (sec) | Node Δ | Web (sec) | Web Δ | Speedup |\n")
		sb.WriteString("|------|-------------|------------|--------|-----------|-------|---------|\n")
	} else {
		sb.WriteString("| Test | Description | Node (sec) | Web (sec) | Speedup |\n")
		sb.WriteString("|------|-------------|------------|-----------|---------|")
		sb.WriteString("\n")
	}

	// Print table rows
	for _, testNum := range sortedTests {
		nodeTest, hasNode := nodeMap[testNum]
		webTest, hasWeb := webMap[testNum]

		if !hasNode && !hasWeb {
			continue
		}

		description := ""
		if hasNode {
			description = nodeTest.TestDescription
		} else if hasWeb {
			description = webTest.TestDescription
		}

		// Truncate description to remove "Test X: " prefix
		description = strings.TrimPrefix(description, fmt.Sprintf("Test %d: ", testNum))

		// Node duration
		nodeDur := "-"
		nodeDelta := ""
		if hasNode {
			nodeDur = fmt.Sprintf("%.3f", nodeTest.Duration)
			if hasPrevNode {
				if prevNode, ok := prevNodeMap[testNum]; ok {
					delta := nodeTest.Duration - prevNode.Duration
					pct := (delta / prevNode.Duration) * 100
					if delta > 0 {
						nodeDelta = fmt.Sprintf("+%.3f (+%.1f%%)", delta, pct)
					} else {
						nodeDelta = fmt.Sprintf("%.3f (%.1f%%)", delta, pct)
					}
				} else {
					nodeDelta = "NEW"
				}
			}
		}

		// Web duration
		webDur := "-"
		webDelta := ""
		if hasWeb {
			webDur = fmt.Sprintf("%.3f", webTest.Duration)
			if hasPrevWeb {
				if prevWeb, ok := prevWebMap[testNum]; ok {
					delta := webTest.Duration - prevWeb.Duration
					pct := (delta / prevWeb.Duration) * 100
					if delta > 0 {
						webDelta = fmt.Sprintf("+%.3f (+%.1f%%)", delta, pct)
					} else {
						webDelta = fmt.Sprintf("%.3f (%.1f%%)", delta, pct)
					}
				} else {
					webDelta = "NEW"
				}
			}
		}

		// Calculate speedup (Node/Web)
		speedup := "-"
		if hasNode && hasWeb {
			ratio := webTest.Duration / nodeTest.Duration
			speedup = fmt.Sprintf("%.2fx", ratio)
		}

		// Print row
		if hasPrevNode || hasPrevWeb {
			sb.WriteString(fmt.Sprintf("| %d | %s | %s | %s | %s | %s | %s |\n",
				testNum, description, nodeDur, nodeDelta, webDur, webDelta, speedup))
		} else {
			sb.WriteString(fmt.Sprintf("| %d | %s | %s | %s | %s |\n",
				testNum, description, nodeDur, webDur, speedup))
		}
	}

	// Print summary
	sb.WriteString("\n")
	sb.WriteString("## Summary\n")
	sb.WriteString("\n")

	var totalNode, totalWeb float64
	commonTests := 0

	for testNum := range testNumbers {
		nodeTest, hasNode := nodeMap[testNum]
		webTest, hasWeb := webMap[testNum]

		if hasNode && hasWeb {
			totalNode += nodeTest.Duration
			totalWeb += webTest.Duration
			commonTests++
		}
	}

	if commonTests > 0 {
		sb.WriteString(fmt.Sprintf("- **Total Node Time**: %.3f seconds\n", totalNode))
		sb.WriteString(fmt.Sprintf("- **Total Web Time**: %.3f seconds\n", totalWeb))
		sb.WriteString(fmt.Sprintf("- **Overall Speedup**: %.2fx (Node is %.1f%% faster)\n",
			totalWeb/totalNode, ((totalWeb-totalNode)/totalWeb)*100))
		sb.WriteString(fmt.Sprintf("- **Tests Compared**: %d\n", commonTests))
	}

	return sb.String()
}

