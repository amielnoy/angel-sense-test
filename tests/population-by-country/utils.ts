import type PopulationByCountryPage from '../../Pages/worldometers-population-page'

export const normalizeHeader = (text: string): string =>
  text
    .replace(/\u00a0/g, ' ')
    .replace(/\u00b2/g, '2')
    .replace(/\[[^\]]*\]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()

export const normalizeNumberText = (text: string): string =>
  text
    .replace(/\u2212/g, '-')
    .replace(/\u00a0/g, ' ')
    .replace(/,/g, '')
    .replace(/\s+/g, ' ')
    .trim()

export const parseNumber = (text: string): number => {
  const normalized = normalizeNumberText(text)
  const match = normalized.match(/-?\d+(?:\.\d+)?/)
  return match ? Number(match[0]) : NaN
}

export const getRowsLocator = async (populationPage: PopulationByCountryPage) => {
  if ((await populationPage.rowsRole.count()) > 0) return populationPage.rowsRole
  return populationPage.rowsCss
}

export const getHeaderIndex = async (populationPage: PopulationByCountryPage, header: string): Promise<number> => {
  const headers = await populationPage.getHeaders()
  const target = normalizeHeader(header)
  const idx = headers.findIndex(h => normalizeHeader(h) === target)
  if (idx === -1) {
    throw new Error(`Header not found: "${header}". Available: [${headers.join(', ')}]`)
  }
  return idx
}
