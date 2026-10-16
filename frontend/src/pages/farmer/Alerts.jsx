import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Bell, CalendarClock, CheckCheck, CloudRain, ShieldAlert } from 'lucide-react'
import PageContainer from '../../components/PageContainer'
import { EmptyState, ErrorState, LoadingState } from '../../components/StateViews'
import { getAlertTypes, listAlerts, markAllAlertsRead, setAlertRead } from '../../services/farmerService'
import { timeAgo } from '../../utils/format'

const TYPE_ICON = { Weather: CloudRain, 'Crop health': AlertTriangle, 'Expert review': ShieldAlert, 'Follow-up': CalendarClock }
const SEVERITY_TONE = { High: 'bg-red-50 text-red-600', Medium: 'bg-amber-50 text-amber-600', Low: 'bg-emerald-50 text-emerald-600', Info: 'bg-sky-50 text-sky-600' }
const READ_STATE_OPTIONS = ['All', 'Unread', 'Read']
const selectClass = 'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-200'

export default function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [types, setTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [type, setType] = useState('All')
  const [readState, setReadState] = useState('All')

  useEffect(() => {
    getAlertTypes().then(setTypes)
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setAlerts(await listAlerts({ type, readState }))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [type, readState])

  useEffect(() => {
    load()
  }, [load])

  const toggleRead = async (alert) => {
    setAlerts((prev) => prev.map((a) => (a.id === alert.id ? { ...a, read: !a.read } : a)))
    try {
      await setAlertRead(alert.id, !alert.read)
    } catch {
      load() // revert the optimistic update if the demo store write somehow fails
    }
  }

  const markAllRead = async () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })))
    await markAllAlertsRead()
  }

  const unreadCount = alerts.filter((a) => !a.read).length

  return (
    <PageContainer className="max-w-3xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Alerts & notifications</h1>
          <p className="mt-1 text-slate-600">Weather, crop-health and review updates for your farm.</p>
        </div>
        {unreadCount > 0 && (
          <button type="button" onClick={markAllRead} className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline">
            <CheckCheck className="h-4 w-4" /> Mark all as read
          </button>
        )}
      </div>

      <p className="text-xs text-slate-400">Sample alerts for this demo. Read/unread state is saved locally in your browser only; no real push notifications are sent.</p>

      <div className="flex flex-wrap gap-3">
        <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Filter by alert type" className={selectClass}>
          <option value="All">All types</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select value={readState} onChange={(e) => setReadState(e.target.value)} aria-label="Filter by read state" className={selectClass}>
          {READ_STATE_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <LoadingState label="Loading alerts..." />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : alerts.length === 0 ? (
        <EmptyState icon={Bell} title="No alerts" text="Nothing matches these filters right now." />
      ) : (
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {alerts.map((a) => {
            const Icon = TYPE_ICON[a.type] || Bell
            return (
              <li key={a.id} className={`flex items-start gap-3 px-4 py-4 sm:px-5 ${!a.read ? 'bg-brand-50/40' : ''}`}>
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${SEVERITY_TONE[a.severity] || SEVERITY_TONE.Info}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className={`text-sm ${a.read ? 'font-medium text-slate-700' : 'font-semibold text-slate-900'}`}>{a.title}</p>
                    {!a.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-600" aria-label="Unread" />}
                  </div>
                  <p className="mt-0.5 text-sm text-slate-600">{a.message}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span>{timeAgo(a.createdAt)}</span>
                    {a.relatedReportId && (
                      <Link to={`/farmer/reports/${a.relatedReportId}`} className="font-medium text-brand-700 hover:underline">
                        View report {a.relatedReportId}
                      </Link>
                    )}
                    {a.relatedFollowUpId && (
                      <Link to={`/farmer/follow-ups/${a.relatedFollowUpId}`} className="font-medium text-brand-700 hover:underline">
                        View follow-up
                      </Link>
                    )}
                    <button type="button" onClick={() => toggleRead(a)} className="font-medium text-slate-500 hover:text-slate-800 hover:underline">
                      Mark as {a.read ? 'unread' : 'read'}
                    </button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </PageContainer>
  )
}
