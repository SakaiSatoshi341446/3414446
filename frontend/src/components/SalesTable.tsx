import type { SalesRecord } from '../lib/api'

interface SalesTableProps {
  data: SalesRecord[]
}

const containerStyle = {
  overflowX: 'auto',
  border: '1px solid rgba(148, 163, 184, 0.2)',
  borderRadius: '16px',
  background: 'rgba(15, 23, 42, 0.72)',
} as const

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  minWidth: '720px',
} as const

const headerCellStyle = {
  padding: '14px 16px',
  borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
  color: '#cbd5e1',
  fontSize: '0.875rem',
  fontWeight: 700,
  textAlign: 'left',
  background: 'rgba(15, 23, 42, 0.9)',
} as const

const bodyCellStyle = {
  padding: '14px 16px',
  borderBottom: '1px solid rgba(148, 163, 184, 0.12)',
  color: '#e5eefb',
  fontSize: '0.95rem',
} as const

const emptyStyle = {
  padding: '24px',
  border: '1px solid rgba(148, 163, 184, 0.2)',
  borderRadius: '16px',
  background: 'rgba(15, 23, 42, 0.72)',
  color: '#cbd5e1',
  textAlign: 'center',
} as const

function formatDate(value: string): string {
  return value.includes('T') ? value.slice(0, 10) : value
}

function formatNumber(value: number): string {
  return value.toLocaleString('ja-JP')
}

export function SalesTable({ data }: SalesTableProps) {
  if (data.length === 0) {
    return <p style={emptyStyle}>データがありません</p>
  }

  return (
    <div style={containerStyle}>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={headerCellStyle}>売上日</th>
            <th style={headerCellStyle}>商品名</th>
            <th style={headerCellStyle}>販売数量</th>
            <th style={headerCellStyle}>単価</th>
            <th style={headerCellStyle}>売上金額</th>
          </tr>
        </thead>
        <tbody>
          {data.map((record) => (
            <tr key={record.id}>
              <td style={bodyCellStyle}>{formatDate(record.date)}</td>
              <td style={bodyCellStyle}>{record.product_name}</td>
              <td style={bodyCellStyle}>{record.quantity}</td>
              <td style={bodyCellStyle}>{formatNumber(record.unit_price)}</td>
              <td style={bodyCellStyle}>
                {formatNumber(record.sales_amount ?? record.quantity * record.unit_price)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
