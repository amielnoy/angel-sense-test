# Worldometer Population-by-Country Test Plan

## Application Overview

Test plan for the Worldometer Population by Country table (https://www.worldometers.info/world-population/population-by-country/).

## Test Scenarios

### 1. Population by Country — Worldometer

**Seed:** `tests/seed.spec.ts`

#### 1.1. Page Navigation & Ready

**File:** `tests/population-by-country/navigation-ready.spec.ts`

**Steps:**
  1. Open https://www.worldometers.info/world-population/population-by-country/
  2. Dismiss any consent/overlay if present
  3. Wait for the population table and header buttons to be visible

**Expected Results:**
  - Page title contains 'Population by Country (2025) - Worldometer'
  - Table headers visible and at least one row present
  - `PopulationByCountryPage.waitForReady()` completes successfully

#### 1.2. Verify Table Headers

**File:** `tests/population-by-country/verify-headers.spec.ts`

**Steps:**
  1. Load page and wait for ready state
  2. Call `getHeaders()` from the page object
  3. Compare result to canonical header list

**Expected Results:**
  - Headers match canonical sequence: #, Country (or dependency), Population 2025, Yearly Change, Net Change, Density (P/Km²), Land Area (Km²), Migrants (net), Fert. Rate, Median Age, Urban Pop %, World Share
  - Headers are in expected order (allow whitespace differences)

#### 1.3. Search — Exact Match (India)

**File:** `tests/population-by-country/search-exact.spec.ts`

**Steps:**
  1. Navigate to page and wait for ready
  2. Call `setSearch('India')`
  3. Wait for table update
  4. Assert a visible row contains 'India'

**Expected Results:**
  - A row for 'India' is visible
  - Expected cells (Population, Yearly Change) contain plausible numeric/text formats

#### 1.4. Search — Partial Match & Case Insensitivity

**File:** `tests/population-by-country/search-partial.spec.ts`

**Steps:**
  1. Navigate and wait for ready
  2. Call `setSearch('uni')` (lowercase)
  3. Inspect visible rows

**Expected Results:**
  - Rows like 'United States' and/or 'United Kingdom' appear
  - Search behaves case-insensitively and supports substring matches

#### 1.5. Search — No Results (Negative)

**File:** `tests/population-by-country/search-no-results.spec.ts`

**Steps:**
  1. Navigate and wait
  2. Call `setSearch('not-a-country')`
  3. Wait for table update

**Expected Results:**
  - Table shows zero matching rows or displays an explicit 'no matching records' message
  - No unrelated rows remain visible

#### 1.6. Sort Column — Numeric (Population 2025)

**File:** `tests/population-by-country/sort-numeric.spec.ts`

**Steps:**
  1. Navigate and wait for ready
  2. Click 'Population 2025' header to sort ascending
  3. Read top 5 population values
  4. Click again to sort descending and read top 5

**Expected Results:**
  - Ascending values are non-decreasing
  - Descending values are non-increasing
  - Toggling the header changes sort direction

#### 1.7. Sort Column — Textual (Country)

**File:** `tests/population-by-country/sort-text.spec.ts`

**Steps:**
  1. Navigate and wait
  2. Click 'Country (or dependency)' header to sort ascending then descending
  3. Read first 10 country names each direction

**Expected Results:**
  - Names follow alphabetical order (case-insensitive) for both directions
  - Sort is stable and consistent

#### 1.8. Row Link Navigation

**File:** `tests/population-by-country/row-link.spec.ts`

**Steps:**
  1. Locate row for 'China'
  2. Click the country link in that row
  3. Wait for navigation

**Expected Results:**
  - URL contains '/world-population/china-population/'
  - Destination page title or header indicates China

#### 1.9. Data Extraction — UI vs HTTP Fallback

**File:** `tests/population-by-country/data-extraction.spec.ts`

**Steps:**
  1. Use `getTableData(limit=50)` to extract first 50 rows via UI
  2. Use `fetchTableHtml()` + `parseTableHtml(limit=50)` to extract server HTML fallback
  3. Compare sampled rows (top 10) between UI and parsed HTML

**Expected Results:**
  - Core fields (country, population, yearly change) match or differ only by formatting (commas/unicode signs)
  - Parity >= 95% between UI and fetch results for sampled fields or documented explanation for differences

#### 1.10. Performance / Large Table Load

**File:** `tests/population-by-country/performance.spec.ts`

**Steps:**
  1. Measure time from navigation start to `waitForReady()` completion
  2. Count number of rows present in DOM or via parsed HTML

**Expected Results:**
  - Table becomes ready within acceptable threshold (recommended < 10s)
  - Row count is approximately 233 (tolerate small deltas)

#### 1.11. Consent / Overlay Robustness

**File:** `tests/population-by-country/consent-handling.spec.ts`

**Steps:**
  1. Reload page to surface consent overlays if present
  2. Verify page object dismisses overlay automatically
  3. Proceed to perform a search or read headers

**Expected Results:**
  - Consent/overlay is dismissed without failing the test
  - Subsequent interactions succeed as normal

#### 1.12. Accessibility Smoke

**File:** `tests/population-by-country/accessibility-smoke.spec.ts`

**Steps:**
  1. Capture accessibility snapshot of the page/table
  2. Verify table elements expose roles and the search input has accessible name 'Search within table'

**Expected Results:**
  - Table has accessible roles (rowgroup/columnheader/cell)
  - Search input has accessible name 'Search within table'

#### 1.13. Edge Case — Numeric Parsing (Unicode minus, non-breaking spaces)

**File:** `tests/population-by-country/parse-edge-cases.spec.ts`

**Steps:**
  1. Read cells containing negative numbers and special symbols
  2. Normalize text and attempt numeric parse

**Expected Results:**
  - Normalization handles Unicode minus and non-breaking characters
  - Parsed numeric values are valid and within expected ranges
