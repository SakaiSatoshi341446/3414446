import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { DateAggItem } from '../lib/api'

interface DateChartProps {
  data: DateAggItem[]
}

const numberFormatter = new Intl.NumberFormat('ja-JP')

function formatSales(value: number) {
  return numberFormatter.format(value)
}

export function DateChart({ data }: DateChartProps) {
  if (data.length === 0) {
    return (
      <section>
        <h2>日別売上推移</h2>
        <p>データがありません</p>
      </section>
    )
  }

  return (
    <section>
      <h2>日別売上推移</h2>
      <div style={{ width: '100%', height: 360 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 16, right: 24, left: 8, bottom: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={formatSales} />
            <Tooltip formatter={(value: number) => formatSales(value)} />
            <Legend />
            <Line
              type="monotone"
              dataKey="total_sales"
              name="売上"
              stroke="#34d399"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
