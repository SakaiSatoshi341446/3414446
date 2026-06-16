import { useEffect, useRef, useState } from 'react'

import { DateChart } from './components/DateChart'
import { FilterPanel } from './components/FilterPanel'
import { KPICard } from './components/KPICard'
import { ProductChart } from './components/ProductChart'
import { SalesTable } from './components/SalesTable'
import {
  getByDate,
  getByProduct,
  getSales,
  getSummary,
  type DateAggItem,
  type FilterParams,
  type ProductAggItem,
  type SalesRecord,
  type SummaryResponse,
} from './lib/api'

const initialFilters: FilterParams = {}
const initialSummary: SummaryResponse = {
  total_sales: 0,
  order_count: 0,
}

function App() {
  const [filterParams, setFilterParams] = useState<FilterParams>(initialFilters)
  const [summary, setSummary] = useState<SummaryResponse>(initialSummary)
  const [sales, setSales] = useState<SalesRecord[]>([])
  const [byProduct, setByProduct] = useState<ProductAggItem[]>([])
  const [byDate, setByDate] = useState<DateAggItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const latestRequestId = useRef(0)

  const handleFilterChange = (nextFilters: FilterParams) => {
    setError(null)
    setFilterParams(nextFilters)
  }

  useEffect(() => {
    const requestId = latestRequestId.current + 1
    latestRequestId.current = requestId
    let isActive = true

    async function loadDashboardData() {
      setLoading(true)
      setError(null)

      try {
        const [salesResponse, summaryResponse, byProductResponse, byDateResponse] = await Promise.all([
          getSales(filterParams),
          getSummary(filterParams),
          getByProduct(filterParams),
          getByDate(filterParams),
        ])

        if (!isActive || latestRequestId.current !== requestId) {
          return
        }

        setSales(salesResponse.items)
        setSummary(summaryResponse)
        setByProduct(byProductResponse.items)
        setByDate(byDateResponse.items)
        setError(null)
      } catch (fetchError: unknown) {
        if (!isActive || latestRequestId.current !== requestId) {
          return
        }

        setError(
          fetchError instanceof Error
            ? fetchError.message
            : 'ダッシュボードデータの取得に失敗しました。',
        )
      } finally {
        if (isActive && latestRequestId.current === requestId) {
          setLoading(false)
        }
      }
    }

    void loadDashboardData()

    return () => {
      isActive = false
    }
  }, [filterParams])

  return (
    <main className="app">
      <header className="hero">
        <p className="eyebrow">Sales dashboard</p>
        <h1>販売データダッシュボード</h1>
        <p>フィルタ条件に応じて KPI・集計グラフ・販売明細をまとめて確認できます。</p>
      </header>

      <section id="filters" className="dashboard-section" aria-labelledby="filters-title">
        <div className="section-heading">
          <h2 id="filters-title">フィルタエリア</h2>
          <p>期間と商品名でダッシュボード全体を絞り込みます。</p>
        </div>
        <FilterPanel onFilterChange={handleFilterChange} />
      </section>

      {loading && (
        <section
          id="dashboard-loading-status"
          className="status-message status-message--loading"
          aria-live="polite"
        >
          ロード中...
        </section>
      )}

      {error && (
        <section
          id="dashboard-error-status"
          className="status-message status-message--error"
          aria-live="assertive"
        >
          <span>エラーが発生しました: {error}</span>
          <button type="button" className="status-message__close" onClick={() => setError(null)}>
            閉じる
          </button>
        </section>
      )}

      <section id="kpi-cards" className="dashboard-section" aria-labelledby="kpi-cards-title">
        <div className="section-heading">
          <h2 id="kpi-cards-title">KPI カードエリア</h2>
          <p>売上の主要指標をひと目で確認できます。</p>
        </div>
        <div className="kpi-grid" aria-label="主要KPI">
          <KPICard title="売上合計" value={summary.total_sales} suffix="円" />
          <KPICard title="注文件数" value={summary.order_count} suffix="件" />
        </div>
      </section>

      <section
        id="product-aggregation"
        className="dashboard-section dashboard-section--panel"
        aria-labelledby="product-aggregation-title"
      >
        <h2 id="product-aggregation-title" className="visually-hidden">
          商品別集計エリア
        </h2>
        <ProductChart data={byProduct} />
      </section>

      <section
        id="date-aggregation"
        className="dashboard-section dashboard-section--panel"
        aria-labelledby="date-aggregation-title"
      >
        <h2 id="date-aggregation-title" className="visually-hidden">
          日別集計エリア
        </h2>
        <DateChart data={byDate} />
      </section>

      <section id="sales-details" className="dashboard-section" aria-labelledby="sales-details-title">
        <div className="section-heading">
          <h2 id="sales-details-title">販売明細テーブル</h2>
          <p>フィルタ適用後の販売明細を一覧表示します。</p>
        </div>
        <SalesTable data={sales} />
      </section>
    </main>
  )
}

export default App
