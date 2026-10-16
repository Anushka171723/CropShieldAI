import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CalendarClock, Leaf } from 'lucide-react'
import { StatusBadge } from '../../components/Badges'
import PageContainer from '../../components/PageContainer'
import { EmptyState, ErrorState, LoadingState } from '../../components/StateViews'
import { listFollowUps } from '../../services/farmerService'
import { dueLabel, formatDate } from '../../utils/format'

const STATUS_OPTIONS = ['All', 'Pending', 'Completed']

export default function FollowUps() {
  const [followUps, setFollowUps] = useState([])
  const [status, setStatus] = useState('Pending')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setFollowUps(await listFollowUps({ status }))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => {
    load()
  }, [load])

  return (
    <PageContainer className="max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Follow-up monitoring</h1>
        <p className="mt-1 text-slate-600">Track each case until it is resolved.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
              status === s ? 'border-brand-700 bg-brand-700 text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-brand-400'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState label="Loading follow-ups..." />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : followUps.length === 0 ? (
        <EmptyState icon={CalendarClock} title="No follow-ups" text="Follow-ups appear here once a case is being monitored." />
      ) : (
        <ul className="space-y-2.5">
          {followUps.map((f) => {
            const due = dueLabel(f.dueDate)
            return (
              <li key={f.id}>
                <Link to={`/farmer/follow-ups/${f.id}`} className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white px-4 py-3.5 hover:border-brand-400 hover:bg-brand-50/40">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100">
                    <Leaf className="h-5 w-5 text-slate-400" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">
                      {f.crop} <span className="font-normal text-slate-500">· {f.report?.issue || 'Report unavailable'}</span>
                    </p>
                    <p className="mt-0.5 text-sm text-slate-600">{f.lastUpdate}</p>
                    <p className={`mt-1 text-xs font-medium ${due.overdue ? 'text-red-600' : 'text-slate-500'}`}>
                      {f.status === 'Completed' ? `Completed · due was ${formatDate(f.dueDate)}` : due.text}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusBadge status={f.status} />
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </PageContainer>
  )
}
