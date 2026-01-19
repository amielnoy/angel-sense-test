import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { HttpClient } from '../http/http_client';

/**
 * VirusTotal v3 Axios Client
 *
 * Environment:
 *   - Set VIRUSTOTAL_API_KEY in your environment (e.g., .env) or pass apiKey to the constructor.
 *
 * Minimal usage:
 *   const vt = new VirusTotalClient();
 *   const analysis = await vt.analyzeUrl('https://example.com');
 *   const result = await vt.getAnalysis(analysis.data.id);
 */
export class VirusTotalClient {
  private readonly http: HttpClient;

  constructor(options?: {
    apiKey?: string;
    baseURL?: string;
    axiosOptions?: AxiosRequestConfig;
    httpClient?: HttpClient; // allow injecting a pre-configured HTTP layer
  }) {
    const apiKey = options?.apiKey || process.env.VIRUSTOTAL_API_KEY;
    if (!apiKey) {
      throw new Error('VirusTotalClient: API key is required. Set VIRUSTOTAL_API_KEY or pass { apiKey }');
    }

    const baseURL = options?.baseURL || 'https://www.virustotal.com/api/v3';

    this.http = options?.httpClient || new HttpClient({
      baseURL,
      headers: { 'x-apikey': apiKey },
      axiosOptions: options?.axiosOptions,
    });
  }

  // ----- Helpers -----
  /**
   * VirusTotal URL identifier is the URL base64-encoded without padding.
   */
  static urlToId(url: string): string {
    const b64 = Buffer.from(url).toString('base64');
    return b64.replace(/=+$/g, '');
  }

  // ----- Files -----
  /** Get file report by SHA-256/SHA-1/MD5 hash or file ID */
  async getFile(idOrHash: string, config?: AxiosRequestConfig): Promise<AxiosResponse<any>> {
    return this.http.get(`/files/${encodeURIComponent(idOrHash)}`, config);
  }

  // For file uploads, a multipart form is required. You can add later if needed with FormData.

  // ----- URLs -----
  /** Submit a URL for analysis */
  async analyzeUrl(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<any>> {
    // VT expects application/x-www-form-urlencoded with field `url`
    const params = new URLSearchParams();
    params.append('url', url);
    return this.http.post('/urls', params.toString(), {
      headers: { 'content-type': 'application/x-www-form-urlencoded', ...(config?.headers as any) },
      ...config,
    });
  }

  /** Get URL report by URL id (use urlToId to convert a raw URL) */
  async getUrl(urlId: string, config?: AxiosRequestConfig): Promise<AxiosResponse<any>> {
    return this.http.get(`/urls/${encodeURIComponent(urlId)}`, config);
  }

  // ----- Analyses -----
  /** Get analysis result by analysis id returned from analyze endpoints */
  async getAnalysis(analysisId: string, config?: AxiosRequestConfig): Promise<AxiosResponse<any>> {
    return this.http.get(`/analyses/${encodeURIComponent(analysisId)}`, config);
  }

  // ----- Domains -----
  async getDomain(domain: string, config?: AxiosRequestConfig): Promise<AxiosResponse<any>> {
    return this.http.get(`/domains/${encodeURIComponent(domain)}`, config);
  }

  // ----- IP Addresses -----
  async getIpAddress(ip: string, config?: AxiosRequestConfig): Promise<AxiosResponse<any>> {
    return this.http.get(`/ip_addresses/${encodeURIComponent(ip)}`, config);
  }
}

export default VirusTotalClient;
