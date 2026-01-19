export class ApiHelpers {
  private authHeader: { [key: string]: string };
  constructor(private request: any) {
    const key = process.env.WC_CONSUMER_KEY;
    const secret = process.env.WC_CONSUMER_SECRET;
    this.authHeader = key && secret
      ? { Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString('base64')}` }
      : {};
  }

  async createOrder(orderData: any) {
    const response = await this.request.post('/wp-json/wc/v3/orders', {
      data: orderData
    });
    return response;
  }

  async getOrder(orderId: number) {
    const response = await this.request.get(`/wp-json/wc/v3/orders/${orderId}`);
    return response;
  }

  async cancelOrder(orderId: number) {
    const response = await this.request.put(`/wp-json/wc/v3/orders/${orderId}`, {
      data: {
        status: 'cancelled'
      }
    });
    return response;
  }
}