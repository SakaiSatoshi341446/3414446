export const API_BASE_URL = 'http://localhost:8000/api'

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

  let response: Response
  try {
    response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown network error'
    throw new Error(`Network error while requesting ${url}: ${message}`)
  }

  const bodyText = await response.text()

  if (!response.ok) {
    throw new Error(getErrorMessage(bodyText, response))
  }

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
