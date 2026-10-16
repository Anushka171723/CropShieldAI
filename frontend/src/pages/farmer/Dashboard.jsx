import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowRight, Bell, CalendarClock, Camera, CloudRain, Droplets, FileText, Leaf, Map, Repeat, Sprout, Thermometer } from 'lucide-react'
import { RiskBadge, StatusBadge } from '../../components/Badges'
import PageContainer from '../../components/PageContainer'
import { EmptyState, ErrorState, LoadingState } from '../../components/StateViews'
import { useAuth } from '../../hooks/useAuth'
import { getFarmerDashboard } from '../../services/farmerService'
import { formatDate, timeAgo } from '../../utils/format'

const QUICK_ACTIONS = [
  { icon: Camera, label: 'New report', to: '/farmer/new-report' },
  { icon: Map, label: 'Hotspot map', to: '/farmer/hotspots' },
  { icon: Bell, label: 'Alerts', to: '/farmer/alerts' },
  { icon: Repeat, label: 'Follow-ups', to: '/farmer/follow-ups' },
]

const SEVERITY_ICON = { High: 'bg-red-50 text-red-600', Medium: 'bg-amber-50 text-amber-600', Low: 'bg-emerald-50 text-emerald-600', Info: 'bg-sky-50 text-sky-600' }

const greeting = () => {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

function Panel({ title, to, linkText = 'View all', children, className = '' }) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white ${className}`}>
      <div className="flex items-center justify-between px-4 pt-4 sm:px-5">
        <h2 className="font-semibold text-slate-900">{title}</h2>
        {to && (
          <Link to={to} className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
            {linkText} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
      {children}
    </section>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setData(await getFarmerDashboard())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  if (loading) return <LoadingState label="Loading your dashboard..." />
  if (error) return <ErrorState message={error} onRetry={load} />

  const { profile, stats, recentReports, weather, nearbyRisk, alerts, followUps } = data
  const firstName = (user?.name || profile.name).split(' ')[0]

  const STATS = [
    { label: 'Total reports', value: stats.totalReports, to: '/farmer/reports', icon: FileText },
    { label: 'Pending expert review', value: stats.pendingReview, to: '/farmer/reports', icon: CalendarClock, accent: stats.pendingReview > 0 && 'text-amber-600' },
    { label: 'High-risk cases', value: stats.highRisk, to: '/farmer/reports', icon: AlertTriangle, accent: stats.highRisk > 0 && 'text-red-600' },
    { label: 'Resolved cases', value: stats.resolved, to: '/farmer/reports', icon: Bell },
  ]

  return (
    <PageContainer className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {greeting()}, {firstName}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {weather.location} · {weather.temperatureC}°C · {weather.humidity}% humidity
            <span className="ml-1 rounded bg-amber-50 px-1 text-[10px] font-semibold uppercase text-amber-700" title="Sample weather data, not a live forecast">
              Sample
            </span>
            {stats.pendingReview > 0 && (
              <span className="font-medium text-amber-700">
                {' '}
                · {stats.pendingReview} report{stats.pendingReview > 1 ? 's' : ''} awaiting expert review
              </span>
            )}
          </p>
        </div>
        <Link
          to="/farmer/new-report"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
        >
          <Camera className="h-4 w-4" /> New crop report
        </Link>
      </div>

      {/* Stats as one bar, not four cards */}
      <div className="grid grid-cols-2 divide-slate-200 rounded-xl border border-slate-200 bg-white lg:grid-cols-4 lg:divide-x">
        {STATS.map(({ label, value, to, icon: Icon, accent }, i) => (
          <Link key={label} to={to} className={`flex items-center gap-3 px-4 py-4 hover:bg-slate-50 sm:px-5 ${i > 1 ? 'border-t border-slate-200 lg:border-t-0' : ''} ${i % 2 === 1 ? 'border-l border-slate-200 lg:border-l-0' : ''}`}>
            <Icon className="h-5 w-5 shrink-0 text-slate-400" />
            <div>
              <p className={`text-2xl font-bold leading-none ${accent || 'text-slate-900'}`}>{value}</p>
              <p className="mt-1 text-xs text-slate-600">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Reports + weather preview */}
      <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <Panel title="Recent crop reports" to="/farmer/reports">
          {recentReports.length === 0 ? (
            <EmptyState icon={Leaf} title="No reports yet" text="Submit your first crop report to see results here." />
          ) : (
            <div className="mt-3 overflow-x-auto px-4 pb-3 sm:px-5">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-slate-500">
                  <tr className="border-b border-slate-100">
                    <th className="py-2 pr-3 font-medium">Crop</th>
                    <th className="py-2 pr-3 font-medium">Issue</th>
                    <th className="py-2 pr-3 font-medium">Risk</th>
                    <th className="py-2 pr-3 font-medium">Review</th>
                    <th className="py-2 text-right font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentReports.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="py-3 pr-3 font-medium text-slate-900">
                        <Link to={`/farmer/reports/${r.id}`} className="flex items-center gap-2 hover:text-brand-800">
                          <Leaf className="h-4 w-4 text-brand-600" /> {r.crop}
                        </Link>
                      </td>
                      <td className="py-3 pr-3 text-slate-700">{r.issue}</td>
                      <td className="py-3 pr-3">
                        <RiskBadge level={r.riskLevel} />
                      </td>
                      <td className="py-3 pr-3">
                        <StatusBadge status={r.reviewStatus} />
                      </td>
                      <td className="whitespace-nowrap py-3 text-right text-slate-600">{formatDate(r.submittedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel title="Weather preview" linkText="Sample data">
          <div className="px-4 pb-4 pt-3 sm:px-5">
            <p className="text-sm leading-relaxed text-slate-700">{weather.condition} near {weather.location}.</p>
            <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-center">
              {[
                { icon: Thermometer, value: `${weather.temperatureC}°C`, label: 'Temp' },
                { icon: Droplets, value: `${weather.humidity}%`, label: 'Humidity' },
                { icon: CloudRain, value: `${weather.rainfallMm} mm`, label: 'Rain' },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label}>
                  <Icon className="mx-auto h-4 w-4 text-slate-400" />
                  <dd className="mt-1 text-sm font-semibold text-slate-900">{value}</dd>
                  <dt className="text-xs text-slate-500">{label}</dt>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs text-slate-400">Sample forecast, not a live weather feed.</p>
          </div>
        </Panel>
      </div>

      {/* Quick actions: small links, not feature cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {QUICK_ACTIONS.map(({ icon: Icon, label, to }) => (
          <Link key={label} to={to} className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm font-medium text-slate-800 hover:border-brand-400 hover:bg-brand-50/50">
            <Icon className="h-[18px] w-[18px] text-brand-700" /> {label}
          </Link>
        ))}
      </div>

      {/* Nearby risk + alerts + follow-ups */}
      <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <Panel title="Nearby risk summary" to="/farmer/hotspots" linkText="Open map">
          <div className="px-4 py-4 sm:px-5">
            <p className="text-sm text-slate-600">
              Within {nearbyRisk.radiusKm} km of your farm (<span className="font-medium text-slate-800">illustrative sample data</span>):
            </p>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {['High', 'Medium', 'Low'].map((level) => (
                <div key={level} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-3 text-center">
                  <p className="text-2xl font-bold text-slate-900">{nearbyRisk.counts[level]}</p>
                  <RiskBadge level={level} />
                </div>
              ))}
            </div>
            {nearbyRisk.closest.length > 0 && (
              <ul className="mt-4 divide-y divide-slate-100 border-t border-slate-100 pt-3">
                {nearbyRisk.closest.map((h) => (
                  <li key={h.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <span className="text-slate-800">
                      {h.name} <span className="text-slate-500">· {h.crop}</span>
                    </span>
                    <span className="shrink-0 text-xs text-slate-500">{h.distanceKm.toFixed(1)} km away</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel title="Important alerts" to="/farmer/alerts">
            {alerts.items.length === 0 ? (
              <EmptyState icon={Bell} title="No active alerts" text="You are all clear for now." />
            ) : (
              <ul className="mt-2 divide-y divide-slate-100 px-4 pb-1 sm:px-5">
                {alerts.items.map((a) => (
                  <li key={a.id} className="flex items-start gap-3 py-3">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${SEVERITY_ICON[a.severity]}`}>
                      <AlertTriangle className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium ${a.read ? 'text-slate-600' : 'text-slate-900'}`}>{a.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{timeAgo(a.createdAt)}</p>
                    </div>
                    {!a.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-600" aria-label="Unread" />}
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Pending follow-ups" to="/farmer/follow-ups">
            {followUps.length === 0 ? (
              <EmptyState icon={CalendarClock} title="No follow-ups" text="Follow-ups appear once a case is being monitored." />
            ) : (
              <ul className="mt-2 divide-y divide-slate-100 px-4 pb-1 sm:px-5">
                {followUps.map((f) => (
                  <li key={f.id} className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium text-slate-900">{f.crop}</p>
                      <StatusBadge status={f.status} />
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">Due {formatDate(f.dueDate)}</p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>

      {/* How it helps: short, kept below the work */}
      <section className="rounded-xl bg-brand-50 px-5 py-6 sm:px-7">
        <h2 className="font-semibold text-brand-900">How CropShield helps</h2>
        <ol className="mt-4 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Upload a photo', 'Report symptoms with a clear picture of the affected crop.'],
            ['Get an AI check', 'Simulated disease and pest detection with a confidence score.'],
            ['Expert validates', 'An agriculture expert confirms or corrects the result.'],
            ['Act and follow up', 'Follow the advisory in your language and track recovery.'],
          ].map(([title, text], i) => (
            <li key={title} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-800 text-xs font-bold text-white">
                <Sprout className="sr-only" />
                {i + 1}
              </span>
              <div>
                <p className="font-medium text-brand-900">{title}</p>
                <p className="mt-0.5 text-brand-900/70">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </PageContainer>
  )
}
