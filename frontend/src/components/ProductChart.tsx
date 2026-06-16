import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { ProductAggItem } from '../lib/api'

interface ProductChartProps {
  data: ProductAggItem[]
}

const numberFormatter = new Intl.NumberFormat('ja-JP')

function formatSales(value: number) {
  return numberFormatter.format(value)
}

export function ProductChart({ data }: ProductChartProps) {
  if (data.length === 0) {
    return (
      <section>
        <h2>商品別売上</h2>
        <p>データがありません</p>
      </section>
    )
  }

  return (
    <section>
      <h2>商品別売上</h2>
      <div style={{ width: '100%', height: 360 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 16, right: 24, left: 8, bottom: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
            <XAxis dataKey="product_name" />
            <YAxis tickFormatter={formatSales} />
            <Tooltip formatter={(value: number) => formatSales(value)} />
            <Legend />
            <Bar dataKey="total_sales" name="売上" fill="#38bdf8" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
