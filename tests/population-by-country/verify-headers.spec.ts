import test from '../../Fixtures/testSetup'
import { expect } from '@playwright/test'
import { normalizeHeader } from './utils'

test.describe('Population by Country - Verify Headers', () => {
  test('headers match canonical sequence', async ({ populationPage }) => {
    test.setTimeout(100000)
    await populationPage.goto()

    const actual = (await populationPage.getHeaders()).map(normalizeHeader)
    const expected = [
      '#',
      'country (or dependency)',
      'population 2025',
      'yearly change',
      'net change',
      'density (p/km2)',
      'land area (km2)',
      'migrants (net)',
      'fert. rate',
      'median age',
      'urban pop %',
      'world share',
    ].map(normalizeHeader)

    expect(actual).toEqual(expected)
  })
})
