interface KPICardProps {
  title: string
  value: number
  suffix?: string
}

export function KPICard({ title, value, suffix }: KPICardProps) {
  const formattedValue = `${value.toLocaleString('ja-JP')}${suffix ? ` ${suffix}` : ''}`

  return (
    <article className="kpi-card">
      <p className="kpi-card__title">{title}</p>
      <p className="kpi-card__value">{formattedValue}</p>
    </article>
  )
}

