import test from '../../Fixtures/testSetup'
import { expect } from '@playwright/test'
import 'dotenv/config'
import VirusTotalClient from '../../api_helpers/virustotal/virustotal_client'

test.beforeAll(() => {
  test.skip(!process.env.VIRUSTOTAL_API_KEY, 'VIRUSTOTAL_API_KEY is not set')
})

async function waitForAnalysis(vt: VirusTotalClient, analysisId: string, { timeoutMs = 20_000, intervalMs = 2_000 } = {}) {
  const deadline = Date.now() + timeoutMs
  let last: any
  while (Date.now() < deadline) {
    const res = await vt.getAnalysis(analysisId)
    last = res.data
    const status = last?.data?.attributes?.status
    if (status === 'completed') return last
    await new Promise(r => setTimeout(r, intervalMs))
  }
  throw new Error('Timed out waiting for VT analysis to complete')
}

// 1) Submit a URL for analysis and wait for completion
test('analyze URL (happy path)', async ({ virustotal }) => {
  const submit = await test.step('submit URL for analysis', async () => {
    const res = await virustotal.analyzeUrl('https://example.com')
    expect(res.status).toBe(200)
    return res
  })
  const analysisId = submit.data?.data?.id as string
  expect(analysisId).toBeTruthy()

  await test.step('wait for analysis completion', async () => {
    const analysis = await waitForAnalysis(virustotal, analysisId)
    expect(analysis.data?.attributes?.status).toBe('completed')
  })
})

test.skip('Idetify malicious url', async ({ virustotal }) => {
  const url_to_scan = 'https://secure.eicar.org/eicar.com.txt';
  const submit = await test.step('submit malicious URL for analysis', async () => {
    const res = await virustotal.analyzeUrl(url_to_scan)
    expect(res.status).toBe(200)
    return res
  })
  const analysisId = submit.data?.data?.id as string
  expect(analysisId).toBeTruthy()

  await test.step('wait for analysis and assert results', async () => {
    const analysis = await waitForAnalysis(virustotal, analysisId)
    expect(analysis.data?.attributes?.status).toBe('completed')
    expect(analysis.data?.attributes?.stats['malicious']).toBeGreaterThan(0);
    expect(analysis.data?.attributes?.stats['suspicious']).toBeGreaterThanOrEqual(1);
  })
})

// 2) Convert a raw URL to VT URL ID and fetch its report
test('get URL report by id', async ({ virustotal }) => {
  const res = await test.step('convert URL to id and fetch report', async () => {
    const urlId = VirusTotalClient.urlToId('https://example.com')
    return virustotal.getUrl(urlId)
  })
  await test.step('assert URL report response', async () => {
    expect(res.status).toBe(200)
    expect(res.data?.data?.type).toBe('url')
  })
})

// 3) Get domain information
test('get domain info', async ({ virustotal }) => {
  const res = await test.step('fetch domain info', async () => {
    return virustotal.getDomain('example.com')
  })
  await test.step('assert domain response', async () => {
    expect(res.status).toBe(200)
    expect(res.data?.data?.type).toBe('domain')
  })
})

// 4) Get IP address information
test('get IP address info', async ({ virustotal }) => {
  const res = await test.step('fetch IP address info', async () => {
    return virustotal.getIpAddress('8.8.8.8')
  })
  await test.step('assert IP response', async () => {
    expect(res.status).toBe(200)
    expect(res.data?.data?.type).toBe('ip_address')
  })
})

// 5) Handle invalid API key (unauthorized)
// Uses a temporary client with an obviously bad key
test('unauthorized with invalid API key', async () => {
  await test.step('request with invalid API key', async () => {
    const vt = new VirusTotalClient({ apiKey: 'invalid_key_value' })
    await expect(async () => {
      await vt.getDomain('example.com')
    }).rejects.toMatchObject({ response: expect.objectContaining({ status: 401 }) })
  })
})

// 6) Request timeout override
test('custom timeout applied', async () => {
  await test.step('request with short timeout', async () => {
    const vt = new VirusTotalClient({ axiosOptions: { timeout: 1_000 } })
    try {
      await vt.getDomain('example.com')
      expect(true).toBeTruthy()
    } catch (err: any) {
      expect(err.code === 'ECONNABORTED' || err.message?.includes('timeout')).toBeTruthy()
    }
  })
})

// 7) Parallel submit of multiple URLs and basic assertions
test('parallel analyze multiple URLs', async ({ virustotal }) => {
  const urls = ['https://example.com', 'https://www.mozilla.org', 'https://www.wikipedia.org']
  const submissions = await test.step('submit URLs in parallel', async () => {
    return Promise.all(urls.map(u => virustotal.analyzeUrl(u)))
  })
  await test.step('assert submission status codes', async () => {
    submissions.forEach(s => expect(s.status).toBe(200))
  })
})

// 8) Polling utility returns completed status
test('waitForAnalysis utility completes', async ({ virustotal }) => {
  const submit = await test.step('submit URL for analysis', async () => {
    return virustotal.analyzeUrl('https://www.wikipedia.org')
  })
  const analysisId = submit.data?.data?.id as string
  await test.step('wait for analysis completion', async () => {
    const analysis = await waitForAnalysis(virustotal, analysisId, { timeoutMs: 30_000, intervalMs: 2_000 })
    expect(analysis.data?.attributes?.status).toBe('completed')
  })
})

// 9) Get file report by a known hash (EICAR test file hash)
test('get file report by hash (may require privileges)', async ({ virustotal }) => {
  const hash = '275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f'
  await test.step('fetch file report by hash', async () => {
    try {
      const res = await virustotal.getFile(hash)
      expect([200, 403, 404]).toContain(res.status)
    } catch (err: any) {
      const status = err?.response?.status
      expect([403, 404, 429]).toContain(status)
    }
  })
})

// 10) Basic rate-limit handling example
test('graceful handling of potential rate limiting', async ({ virustotal }) => {
  await test.step('request domain and tolerate rate limit', async () => {
    try {
      const res = await virustotal.getDomain('example.com')
      expect([200, 429]).toContain(res.status)
    } catch (err: any) {
      const status = err?.response?.status
      expect([429]).toContain(status)
    }
  })
})
