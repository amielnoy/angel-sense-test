import test from '../../Fixtures/testSetup'
import { expect } from '@playwright/test'
import { normalizeHeader } from './utils'

test.describe('Population by Country - Verify Headers #TableTests', () => {
  test('headers match canonical sequence', async ({ populationPage }) => {
    test.setTimeout(100000)
    const expectedHeaders = [
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
    await test.step('navigate to population table', async () => {
      await populationPage.goto()
    })
    let actual: string[] = []
    await test.step('read actual headers', async () => {
      actual = (await populationPage.getHeaders()).map(normalizeHeader)
    })
    let expected: string[] = []
    await test.step('build expected headers', async () => {
      expected = expectedHeaders
    })
    await test.step('assert header sequence', async () => {
      expect(actual).toEqual(expected)
    })
  })
})
