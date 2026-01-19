import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

export interface HttpClientOptions {
  baseURL?: string
  headers?: Record<string, string>
  axiosOptions?: AxiosRequestConfig
}

/**
 * Minimal HTTP layer wrapping Axios with typed helpers for get/post/put/delete.
 * Intended to be reused by API clients (e.g., VirusTotal).
 */
export class HttpClient {
  private readonly http: AxiosInstance

  constructor(options?: HttpClientOptions) {
    this.http = axios.create({
      baseURL: options?.baseURL,
      headers: options?.headers,
      timeout: options?.axiosOptions?.timeout ?? 30_000,
      ...options?.axiosOptions,
    })
  }

  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.http.get<T>(url, config)
  }

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.http.post<T>(url, data, config)
  }

  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.http.put<T>(url, data, config)
  }

  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.http.delete<T>(url, config)
  }
}

export type { AxiosRequestConfig, AxiosResponse }
