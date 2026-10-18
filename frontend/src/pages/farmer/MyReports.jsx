import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Camera, Search } from 'lucide-react'
import ReportList from '../../components/farmer/ReportList'
import PageContainer from '../../components/PageContainer'
import { getReportCrops, listReports } from '../../services/farmerService'

const STATUS_OPTIONS = ['All', 'Pending', 'Validated', 'Corrected']
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
]

const selectClass = 'rounded-lg border border-slate-300 bg-surface px-3 py-2 text-sm text-slate-700 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-200'

export default function MyReports() {
  const [reports, setReports] = useState([])
  const [crops, setCrops] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [crop, setCrop] = useState('All')
  const [sort, setSort] = useState('newest')

  useEffect(() => {
    getReportCrops().then(setCrops)
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setReports(await listReports({ search, status, crop, sort }))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [search, status, crop, sort])

  useEffect(() => {
    load()
  }, [load])

  const hasActiveFilters = search || status !== 'All' || crop !== 'All'
  const clearFilters = () => {
    setSearch('')
    setStatus('All')
    setCrop('All')
  }

  return (
    <PageContainer className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">My reports</h1>
          <p className="mt-1 text-slate-600">Every crop report you have submitted, with its current status.</p>
        </div>
        <Link to="/farmer/new-report" className="inline-flex items-center gap-2 rounded-lg bg-brand-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-900">
          <Camera className="h-4 w-4" /> New crop report
        </Link>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-surface p-4 sm:flex-row sm:items-center sm:gap-4">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by crop or report ID"
            aria-label="Search reports"
            className="w-full rounded-lg border border-slate-300 bg-surface py-2 pl-9 pr-3 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        </div>

        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by review status" className={selectClass}>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s === 'All' ? 'All statuses' : s}
            </option>
          ))}
        </select>

        <select value={crop} onChange={(e) => setCrop(e.target.value)} aria-label="Filter by crop" className={selectClass}>
          <option value="All">All crops</option>
          {crops.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort reports" className={selectClass}>
          {SORT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button type="button" onClick={clearFilters} className="text-sm font-medium text-brand-700 hover:underline">
            Clear
          </button>
        )}
      </div>

      <ReportList
        reports={reports}
        loading={loading}
        error={error}
        onRetry={load}
        emptyTitle={hasActiveFilters ? 'No reports match your search' : 'No reports yet'}
        emptyText={hasActiveFilters ? 'Try a different crop, status or search term.' : 'Submit your first crop report to see it here.'}
      />
    </PageContainer>
  )
}
