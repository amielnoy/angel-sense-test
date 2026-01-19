#!/bin/bash
# Script to generate Allure report with history preservation

RESULTS_DIR="allure-results"
REPORT_DIR="allure-report"
HISTORY_DIR="allure-history"

# Check if results exist
if [ ! -d "$RESULTS_DIR" ] || [ -z "$(ls -A $RESULTS_DIR 2>/dev/null)" ]; then
  echo "No test results found in $RESULTS_DIR"
  exit 0
fi

# Create history directory if it doesn't exist
mkdir -p "$HISTORY_DIR"

# Remove old report
rm -rf "$REPORT_DIR" || true

# If history exists from previous runs, inject it into results before generation
if [ -d "$HISTORY_DIR" ] && [ "$(ls -A $HISTORY_DIR 2>/dev/null)" ]; then
  echo "Merging history from previous runs into results..."
  mkdir -p "$RESULTS_DIR/history"
  cp -r "$HISTORY_DIR"/* "$RESULTS_DIR/history/" 2>/dev/null || true
fi

# Generate new report
echo "Generating Allure report..."
npx allure generate "$RESULTS_DIR" -o "$REPORT_DIR" || {
  echo "Report generation failed"
  exit 1
}

# Save the updated history for next run
if [ -d "$REPORT_DIR/history" ] && [ "$(ls -A $REPORT_DIR/history 2>/dev/null)" ]; then
  echo "Saving history for next run..."
  mkdir -p "$HISTORY_DIR"
  cp -r "$REPORT_DIR/history"/* "$HISTORY_DIR/" 2>/dev/null || true
fi

echo "Report generated successfully with history at $REPORT_DIR"
