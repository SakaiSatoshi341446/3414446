// Dynamically determine API base URL based on current browser location
const getCurrentApiBaseUrl = (): string => {
  const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  
  if (isLocalhost) {
    // For localhost development
    return `http://${window.location.hostname}:8000/api`;
  }
  
  // For remote/production environments
  return `${window.location.protocol}//${window.location.hostname}:8000/api`;
};

export const API_BASE_URL = getCurrentApiBaseUrl();
console.log(`[API] Using API_BASE_URL: ${API_BASE_URL}`);

export interface SalesRecord {
  id: string
  date: string
  product_name: string
  category?: string
  quantity: number
  unit_price: number
  customer_name?: string
  sales_amount: number
}

export interface SummaryResponse {
  total_sales: number
  order_count: number
}

export interface ProductAggItem {
  product_name: string
  total_sales: number
  order_count: number
}

export interface DateAggItem {
  date: string
  total_sales: number
  order_count: number
}

export interface FilterParams {
  start_date?: string
  end_date?: string
  product_name?: string
}

interface ErrorResponseBody {
  detail?: string
  message?: string
  error?: string
}

export function buildQueryString(filters?: FilterParams): string {
  if (!filters) {
    return ''
  }

  const params = new URLSearchParams()

  if (filters.start_date) {
    params.set('start_date', filters.start_date)
  }

  if (filters.end_date) {
    params.set('end_date', filters.end_date)
  }

  if (filters.product_name) {
    params.set('product_name', filters.product_name)
  }

  const queryString = params.toString()
  return queryString ? `?${queryString}` : ''
}

function getErrorMessage(bodyText: string, response: Response): string {
  if (!bodyText) {
    return `API request failed with status ${response.status}`
  }

  try {
    const parsedBody = JSON.parse(bodyText) as ErrorResponseBody | null
    if (!parsedBody || typeof parsedBody !== 'object') {
      return `API request failed with status ${response.status}`
    }

    return (
      parsedBody.detail ??
      parsedBody.message ??
      parsedBody.error ??
      `API request failed with status ${response.status}`
    )
  } catch {
    return bodyText
  }
}

function parseJson<T>(bodyText: string): T {
  if (!bodyText) {
    throw new Error('API response was empty')
  }

  try {
    return JSON.parse(bodyText) as T
  } catch {
    throw new Error('Failed to parse API response JSON')
  }
}

async function request<T>(path: string, filters?: FilterParams): Promise<T> {
  const url = `${API_BASE_URL}${path}${buildQueryString(filters)}`
  console.log(`[API] Requesting: ${url}`)

  let response: Response
  try {
    response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
      headers: {
        Accept: 'application/json',
      },
    })
    console.log(`[API] Response status: ${response.status}`)
    console.log(`[API] Response headers:`, {
      'content-type': response.headers.get('content-type'),
      'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown network error'
    console.error(`[API] Fetch error:`, error)
    throw new Error(`Network error while requesting ${url}: ${message}`)
  }

  const bodyText = await response.text()

  if (!response.ok) {
    console.error(`[API] Error response: ${bodyText.substring(0, 200)}`)
    throw new Error(getErrorMessage(bodyText, response))
  }

  console.log(`[API] Success: got response of ${bodyText.length} bytes`)
  return parseJson<T>(bodyText)
}

export async function getSales(
  filters?: FilterParams,
): Promise<{ items: SalesRecord[]; count: number }> {
  return request<{ items: SalesRecord[]; count: number }>('/sales', filters)
}

export async function getSummary(filters?: FilterParams): Promise<SummaryResponse> {
  return request<SummaryResponse>('/dashboard/summary', filters)
}

export async function getByProduct(
  filters?: FilterParams,
): Promise<{ items: ProductAggItem[] }> {
  return request<{ items: ProductAggItem[] }>('/dashboard/by-product', filters)
}

export async function getByDate(filters?: FilterParams): Promise<{ items: DateAggItem[] }> {
  return request<{ items: DateAggItem[] }>('/dashboard/by-date', filters)
}
