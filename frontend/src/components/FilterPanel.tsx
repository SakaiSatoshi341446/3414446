import { ChangeEvent, FormEvent, useState } from 'react'

import type { FilterParams } from '../lib/api'

interface FilterPanelProps {
  onFilterChange: (filters: FilterParams) => void
}

const panelStyle = {
  display: 'grid',
  gap: '12px',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  padding: '16px',
  border: '1px solid rgba(148, 163, 184, 0.2)',
  borderRadius: '16px',
  background: 'rgba(15, 23, 42, 0.72)',
} as const

const fieldStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
} as const

const inputStyle = {
  padding: '10px 12px',
  border: '1px solid rgba(148, 163, 184, 0.35)',
  borderRadius: '10px',
  background: 'rgba(15, 23, 42, 0.95)',
  color: '#e5eefb',
} as const

const buttonStyle = {
  alignSelf: 'end',
  padding: '10px 16px',
  border: 'none',
  borderRadius: '10px',
  background: '#38bdf8',
  color: '#0f172a',
  fontWeight: 700,
  cursor: 'pointer',
} as const

export function FilterPanel({ onFilterChange }: FilterPanelProps) {
  const [filters, setFilters] = useState<FilterParams>({
    start_date: '',
    end_date: '',
    product_name: '',
  })

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target

    setFilters((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    onFilterChange({
      start_date: filters.start_date || undefined,
      end_date: filters.end_date || undefined,
      product_name: filters.product_name?.trim() || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} style={panelStyle}>
      <label style={fieldStyle}>
        <span>開始日</span>
        <input
          type="date"
          name="start_date"
          value={filters.start_date ?? ''}
          onChange={handleChange}
          style={inputStyle}
        />
      </label>

      <label style={fieldStyle}>
        <span>終了日</span>
        <input
          type="date"
          name="end_date"
          value={filters.end_date ?? ''}
          onChange={handleChange}
          style={inputStyle}
        />
      </label>

      <label style={fieldStyle}>
        <span>商品名</span>
        <input
          type="text"
          name="product_name"
          value={filters.product_name ?? ''}
          onChange={handleChange}
          placeholder="商品名で検索"
          style={inputStyle}
        />
      </label>

      <button type="submit" style={buttonStyle}>
        絞り込む
      </button>
    </form>
  )
}
