import { Page, Locator, expect } from '@playwright/test'

export type RowData = Record<string, string>

/**
 * Page Object: Worldometers – Population by Country
 * URL: https://www.worldometers.info/world-population/population-by-country/
 *
 * Clean-code guidelines applied:
 * - Single responsibility: Encapsulates navigation and table interactions only.
 * - Strong typing: Avoids `any`; exposes typed helpers.
 * - Robust selectors: Prefer stable ids and patterns; resilient to minor page changes.
 * - No assertions: Suitable for reuse across tests; tests perform assertions.
 */
export class PopulationByCountryPage {
  readonly page: Page
  readonly table: Locator
  // Prefer role-based locators, but keep resilient CSS fallbacks
  readonly searchBox: Locator
  readonly searchBoxCss: Locator
  readonly headerCellsRole: Locator
  readonly headerCellsCss: Locator
  readonly rowsRole: Locator
  readonly rowsCss: Locator

  static readonly url = 'https://www.worldometers.info/world-population/population-by-country/'

  constructor(page: Page) {
    this.page = page
    // Table id can be `example2` (commonly) or `example` depending on site version.
    // Also add DataTables class as a robust fallback.
    this.table  = page.locator('div.datatable-container > table.datatable');
    // Search box (DataTables adds a filter container {tableId}_filter)
    this.searchBox = page.getByPlaceholder("Search...")
    //this.searchBoxCss = page.locator('div[id$="_filter"] input[type="search"], div.dataTables_filter input[type="search"]')
    // Headers and rows (role-first, CSS fallback)
    this.headerCellsRole = this.table.getByRole('columnheader')
    this.headerCellsCss = this.table.locator('thead th')
    this.rowsRole = this.table.locator('tbody').getByRole('row')
    this.rowsCss = this.table.locator('tbody tr')
  }

  async goto() {
    await this.page.goto(PopulationByCountryPage.url, { waitUntil: 'domcontentloaded' })
    // Best-effort handle cookie/consent banners if present
    await this.dismissConsentIfPresent()
    await this.waitForReady()
  }

  /** Ready when table is visible and at least one row is rendered */
  async waitForReady() {
    // Wait for table element to appear
    await this.table.first().waitFor({ state: 'visible' })
    // Wait for DataTables to initialize (wrapper appears) – best effort
    await this.page.locator('.dataTables_wrapper').first().waitFor({ state: 'attached', timeout: 10_000 }).catch(() => {})
    // Wait for at least one row via role or CSS fallback
    const firstRoleRow = this.rowsRole.first()
    const firstCssRow = this.rowsCss.first()
    await Promise.race([
      firstRoleRow.waitFor({ state: 'visible' }),
      firstCssRow.waitFor({ state: 'visible' }),
    ])
  }

  /** Perform a DataTables search (client-side filter) */
  async setSearch(query: string) {
    const input = (await this.searchBox.count()) > 0 ? this.searchBox : this.searchBoxCss
    await input.fill('')
    await input.fill(query)
  }

  async clearSearch() {
    const input = this.searchBox
    await input.fill('')
  }

  async getHeaders(): Promise<string[]> {
    const headersLocator = (await this.headerCellsRole.count()) > 0 ? this.headerCellsRole : this.headerCellsCss
    const texts = await headersLocator.allTextContents()
    return texts.map(this.normalizeHeader)
  }

  async getRowCount(): Promise<number> {
    const rows = (await this.rowsRole.count()) > 0 ? this.rowsRole : this.rowsCss
    return await rows.count()
  }

  /** Returns the row Locator for a given country name (exact match, case-insensitive). */
  rowByCountry(country: string): Locator {
    const pattern = new RegExp(`^${PopulationByCountryPage.escapeRegExp(country)}$`, 'i')
    // Country is typically the 2nd column. Try role-based, fall back to CSS contains.
    const roleRows = this.rowsRole
      .filter({ has: this.page.getByRole('cell', { name: pattern }) })
      .filter({ has: this.page.locator('td:nth-child(2)') })
    const cssRows = this.rowsCss
      .filter({ has: this.page.locator('td:nth-child(2):has-text("' + country + '")') })
    return roleRows.first().or(cssRows.first())
  }

  /** Click to sort by a column header. If direction provided, ensure final state matches it. */
  async sortBy(header: string, direction?: 'asc' | 'desc') {
    const idx = await this.findHeaderIndex(header)
    const headersLocator = (await this.headerCellsRole.count()) > 0 ? this.headerCellsRole : this.headerCellsCss
    const th = headersLocator.nth(idx)
    if (!direction) {
      await th.click()
      return
    }

    // Ensure class reflects desired direction (`sorting_asc`/`sorting_desc`).
    // Click up to 2 times to reach the desired state.
    for (let i = 0; i < 2; i++) {
      const cls = (await th.getAttribute('class')) || ''
      if ((direction === 'asc' && cls.includes('sorting_asc')) || (direction === 'desc' && cls.includes('sorting_desc'))) {
        return
      }
      await th.click()
    }
  }

  /** Get the text content of a cell by country name and column header or index. */
  async getCellText(country: string, column: string | number): Promise<string> {
    const row = this.rowByCountry(country)
    const colIndex = typeof column === 'number' ? column : await this.findHeaderIndex(column)
    // Prefer role-based cell, fallback to nth-child
    const roleCell = row.getByRole('cell').nth(colIndex)
    if (await roleCell.count()) {
      return (await roleCell.textContent())?.trim() ?? ''
    }
    const cssCell = row.locator(`td:nth-child(${colIndex + 1})`)
    return (await cssCell.textContent())?.trim() ?? ''
  }

  /** Return the first N countries from the current (filtered/sorted) view. */
  async getTopCountries(limit = 10): Promise<string[]> {
    // Iterate sequentially to remain robust
    const rows = (await this.rowsRole.count()) > 0 ? this.rowsRole : this.rowsCss
    const count = Math.min(await rows.count(), limit)
    const result: string[] = []
    for (let i = 0; i < count; i++) {
      const row = rows.nth(i)
      const roleCell = row.getByRole('cell').nth(1)
      const hasRole = await roleCell.count()
      const name = hasRole ? await roleCell.textContent() : await row.locator('td:nth-child(2)').textContent()
      result.push((name || '').trim())
    }
    return result
  }

  /** Parse the current table into an array of row objects keyed by normalized header. */
  async getTableData(limit?: number): Promise<RowData[]> {
    const headers = await this.getHeaders()
    const rows = (await this.rowsRole.count()) > 0 ? this.rowsRole : this.rowsCss
    const total = await rows.count()
    const count = typeof limit === 'number' ? Math.min(limit, total) : total
    const data: RowData[] = []
    for (let r = 0; r < count; r++) {
      console.log(`Parsing row ${r + 1} of ${total}`)
      const row = rows.nth(r)
      const cells = row.locator('td')
      const cellCount = await cells.count()
      const obj: RowData = {}
      for (let c = 0; c < Math.min(headers.length, cellCount); c++) {
        const key = headers[c]
        const val = (await cells.nth(c).textContent())?.trim() ?? ''
        obj[key] = val
      }
      data.push(obj)
    }
    return data
  }

  /** Convenience: Fetch a map/object for a specific country row. */
  async getCountryData(country: string): Promise<RowData | null> {
    const headers = await this.getHeaders()
    const row = this.rowByCountry(country)
    if ((await row.count()) === 0) return null
    const cells = row.locator('td')
    const cellCount = await cells.count()
    const obj: RowData = {}
    for (let c = 0; c < Math.min(headers.length, cellCount); c++) {
      const key = headers[c]
      const val = (await cells.nth(c).textContent())?.trim() ?? ''
      obj[key] = val
    }
    return obj
  }

  // ----- Internals -----
  private async findHeaderIndex(header: string): Promise<number> {
    const headers = await this.getHeaders()
    const target = this.normalizeHeader(header)
    const idx = headers.findIndex(h => h === target || this.equalsLoose(h, target))
    if (idx === -1) {
      throw new Error(`Header not found: "${header}". Available: [${headers.join(', ')}]`)
    }
    return idx
  }

  private equalsLoose(a: string, b: string): boolean {
    return a.replace(/\s+/g, ' ').trim().toLowerCase() === b.replace(/\s+/g, ' ').trim().toLowerCase()
  }

  private normalizeHeader = (text: string): string => {
    return text
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/\u00a0/g, ' ')
      .replace(/\[[^\]]*\]/g, '') // remove footnote markers
      .trim()
  }

  private tableSelectorForEval(): string {
    // Prefer the first that exists when evaluated in the page context
    return 'table#example2, table#example'
  }

  static escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  // Dismiss common consent/cookie banners if present (non-fatal)
  private async dismissConsentIfPresent() {
    const buttons = [
      this.page.getByRole('button', { name: /accept all|accept|i agree|agree|consent/i }),
      this.page.getByRole('link', { name: /accept all|accept|i agree|agree|consent/i }),
    ]
    for (const b of buttons) {
      try {
        if (await b.isVisible({ timeout: 1000 })) {
          await b.click({ timeout: 1000 })
          break
        }
      } catch {}
    }
  }
}

export default PopulationByCountryPage
