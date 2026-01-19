import { HttpClient, AxiosRequestConfig, AxiosResponse } from '../http/http_client'

export interface CreateOrderPayload {
  payment_method: string
  payment_method_title?: string
  billing: Record<string, any>
  shipping?: Record<string, any>
  line_items: Array<{ product_id: number; quantity: number }>
  [key: string]: any
}

export interface Order {
  id: number
  status: string
  [key: string]: any
}

/**
 * Orders API client for WooCommerce using the shared HttpClient.
 * Base URL is derived from BASE_URL + "/wp-json/wc/v3".
 */
export class OrdersApiClient {
  constructor(private readonly http: HttpClient) {}

  static fromEnv(): OrdersApiClient {
    const base = (process.env.BASE_URL || '').replace(/\/$/, '')
    const key = process.env.WC_CONSUMER_KEY || ''
    const secret = process.env.WC_CONSUMER_SECRET || ''
    const auth = Buffer.from(`${key}:${secret}`).toString('base64')
    const apiBase = `${base}/wp-json/wc/v3`
    return new OrdersApiClient(
      new HttpClient({
        baseURL: apiBase,
        headers: key && secret ? { Authorization: `Basic ${auth}` } : undefined,
      })
    )
  }

  createOrder(data: CreateOrderPayload, config?: AxiosRequestConfig): Promise<AxiosResponse<Order>> {
    return this.http.post<Order>('/orders', data, config)
  }

  getOrder(orderId: number, config?: AxiosRequestConfig): Promise<AxiosResponse<Order>> {
    return this.http.get<Order>(`/orders/${orderId}`, config)
  }

  cancelOrder(orderId: number, config?: AxiosRequestConfig): Promise<AxiosResponse<Order>> {
    return this.http.put<Order>(`/orders/${orderId}`, { status: 'cancelled' }, config)
  }
}

export default OrdersApiClient
