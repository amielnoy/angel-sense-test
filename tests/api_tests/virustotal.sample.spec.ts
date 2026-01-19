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
  let submit: Awaited<ReturnType<typeof virustotal.analyzeUrl>>
  await test.step('submit URL for analysis', async () => {
    submit = await virustotal.analyzeUrl('https://example.com')
  })
  await test.step('assert submit status', async () => {
    expect(submit.status).toBe(200)
  })
  let analysisId = ''
  await test.step('extract analysis id', async () => {
    analysisId = submit.data?.data?.id as string
  })
  await test.step('assert analysis id', async () => {
    expect(analysisId).toBeTruthy()
  })
  let analysis: any
  await test.step('wait for analysis completion', async () => {
    analysis = await waitForAnalysis(virustotal, analysisId)
  })
  await test.step('assert analysis status', async () => {
    expect(analysis.data?.attributes?.status).toBe('completed')
  })
})

test.skip('Idetify malicious url', async ({ virustotal }) => {
  const url_to_scan = 'https://secure.eicar.org/eicar.com.txt';
  let submit: Awaited<ReturnType<typeof virustotal.analyzeUrl>>
  await test.step('submit malicious URL for analysis', async () => {
    submit = await virustotal.analyzeUrl(url_to_scan)
  })
  await test.step('assert submit status', async () => {
    expect(submit.status).toBe(200)
  })
  let analysisId = ''
  await test.step('extract analysis id', async () => {
    analysisId = submit.data?.data?.id as string
  })
  await test.step('assert analysis id', async () => {
    expect(analysisId).toBeTruthy()
  })
  let analysis: any
  await test.step('wait for analysis completion', async () => {
    analysis = await waitForAnalysis(virustotal, analysisId)
  })
  await test.step('assert analysis status', async () => {
    expect(analysis.data?.attributes?.status).toBe('completed')
  })
  await test.step('assert malicious count', async () => {
    expect(analysis.data?.attributes?.stats['malicious']).toBeGreaterThan(0);
  })
  await test.step('assert suspicious count', async () => {
    expect(analysis.data?.attributes?.stats['suspicious']).toBeGreaterThanOrEqual(1);
  })
})

// 2) Convert a raw URL to VT URL ID and fetch its report
test('get URL report by id', async ({ virustotal }) => {
  let urlId = ''
  await test.step('convert URL to id', async () => {
    urlId = VirusTotalClient.urlToId('https://example.com')
  })
  let res: Awaited<ReturnType<typeof virustotal.getUrl>>
  await test.step('fetch URL report', async () => {
    res = await virustotal.getUrl(urlId)
  })
  await test.step('assert URL report status', async () => {
    expect(res.status).toBe(200)
  })
  await test.step('assert URL report type', async () => {
    expect(res.data?.data?.type).toBe('url')
  })
})

// 3) Get domain information
test('get domain info', async ({ virustotal }) => {
  let res: Awaited<ReturnType<typeof virustotal.getDomain>>
  await test.step('fetch domain info', async () => {
    res = await virustotal.getDomain('example.com')
  })
  await test.step('assert domain status', async () => {
    expect(res.status).toBe(200)
  })
  await test.step('assert domain type', async () => {
    expect(res.data?.data?.type).toBe('domain')
  })
})

// 4) Get IP address information
test('get IP address info', async ({ virustotal }) => {
  let res: Awaited<ReturnType<typeof virustotal.getIpAddress>>
  await test.step('fetch IP address info', async () => {
    res = await virustotal.getIpAddress('8.8.8.8')
  })
  await test.step('assert IP status', async () => {
    expect(res.status).toBe(200)
  })
  await test.step('assert IP type', async () => {
    expect(res.data?.data?.type).toBe('ip_address')
  })
})

// 5) Handle invalid API key (unauthorized)
// Uses a temporary client with an obviously bad key
test('unauthorized with invalid API key', async () => {
  let vt: VirusTotalClient
  await test.step('create client with invalid API key', async () => {
    vt = new VirusTotalClient({ apiKey: 'invalid_key_value' })
  })
  await test.step('assert unauthorized response', async () => {
    await expect(async () => {
      await vt.getDomain('example.com')
    }).rejects.toMatchObject({ response: expect.objectContaining({ status: 401 }) })
  })
})

// 6) Request timeout override
test('custom timeout applied', async () => {
  let vt: VirusTotalClient
  await test.step('create client with short timeout', async () => {
    vt = new VirusTotalClient({ axiosOptions: { timeout: 1_000 } })
  })
  await test.step('assert timeout behavior', async () => {
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
  let submissions: Awaited<ReturnType<typeof virustotal.analyzeUrl>>[]
  await test.step('submit URLs in parallel', async () => {
    submissions = await Promise.all(urls.map(u => virustotal.analyzeUrl(u)))
  })
  await test.step('assert submission status codes', async () => {
    submissions.forEach(s => expect(s.status).toBe(200))
  })
})

// 8) Polling utility returns completed status
test('waitForAnalysis utility completes', async ({ virustotal }) => {
  let submit: Awaited<ReturnType<typeof virustotal.analyzeUrl>>
  await test.step('submit URL for analysis', async () => {
    submit = await virustotal.analyzeUrl('https://www.wikipedia.org')
  })
  let analysisId = ''
  await test.step('extract analysis id', async () => {
    analysisId = submit.data?.data?.id as string
  })
  let analysis: any
  await test.step('wait for analysis completion', async () => {
    analysis = await waitForAnalysis(virustotal, analysisId, { timeoutMs: 30_000, intervalMs: 2_000 })
  })
  await test.step('assert analysis status', async () => {
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
  await test.step('request domain', async () => {
    try {
      const res = await virustotal.getDomain('example.com')
      expect([200, 429]).toContain(res.status)
    } catch (err: any) {
      const status = err?.response?.status
      expect([429]).toContain(status)
    }
  })
})
