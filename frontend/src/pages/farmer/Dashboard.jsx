import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowRight, Bell, CalendarClock, Camera, CloudRain, Droplets, FileText, Leaf, Map, Repeat, Sprout, Thermometer } from 'lucide-react'
import { RiskBadge, StatusBadge } from '../../components/Badges'
import MapPreview, { MAP_LEGEND } from '../../components/MapPreview'
import PageContainer from '../../components/PageContainer'
import { EmptyState, ErrorState, LoadingState } from '../../components/StateViews'
import { useAuth } from '../../hooks/useAuth'
import { getFarmerDashboard } from '../../services/dashboardService'
import { formatDate, timeAgo } from '../../utils/format'

const QUICK_ACTIONS = [
  { icon: Camera, label: 'New report', to: '/farmer/reports/new' },
  { icon: Sprout, label: 'Advisory', to: '/farmer/advisory' },
  { icon: Map, label: 'Hotspot map', to: '/farmer/hotspots' },
  { icon: Repeat, label: 'Follow-ups', to: '/farmer/follow-ups' },
]

const SEVERITY_ICON = { High: 'bg-red-50 text-red-600', Medium: 'bg-amber-50 text-amber-600', Low: 'bg-emerald-50 text-emerald-600' }

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

  const { stats, weather, farm, hotspots, recentPredictions, alerts, followUps } = data
  const pending = recentPredictions.filter((r) => r.status === 'Pending')

  const STATS = [
    { label: 'Total reports', value: stats.totalReports, to: '/farmer/reports', icon: FileText },
    { label: 'Pending expert review', value: stats.pendingReviews, to: '/farmer/reports', icon: CalendarClock, accent: stats.pendingReviews > 0 && 'text-amber-600' },
    { label: 'High-risk cases', value: stats.highRisk, to: '/farmer/reports', icon: AlertTriangle, accent: stats.highRisk > 0 && 'text-red-600' },
    { label: 'Active alerts', value: stats.activeAlerts, to: '/farmer/alerts', icon: Bell },
  ]

  return (
    <PageContainer className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {greeting()}, {user.name.split(' ')[0]}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {weather.location} Â· {weather.temperatureC}Â°C Â· {weather.humidity}% humidity
            {pending.length > 0 && <span className="font-medium text-amber-700"> Â· {pending.length} report{pending.length > 1 ? 's' : ''} awaiting expert review</span>}
          </p>
        </div>
        <Link
          to="/farmer/reports/new"
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

      {/* Reports + weather risk */}
      <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <Panel title="Your reports" to="/farmer/reports">
          {recentPredictions.length === 0 ? (
            <EmptyState icon={Leaf} title="No reports yet" text="Submit your first crop report to see results here." />
          ) : (
            <div className="mt-3 overflow-x-auto px-4 pb-3 sm:px-5">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-slate-500">
                  <tr className="border-b border-slate-100">
                    <th className="py-2 pr-3 font-medium">Crop</th>
                    <th className="py-2 pr-3 font-medium">Issue detected</th>
                    <th className="py-2 pr-3 font-medium">Risk</th>
                    <th className="py-2 pr-3 font-medium">Status</th>
                    <th className="py-2 text-right font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentPredictions.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="py-3 pr-3 font-medium text-slate-900">
                        <Link to={`/farmer/reports/${r.id}`} className="flex items-center gap-2 hover:text-brand-800">
                          <Leaf className="h-4 w-4 text-brand-600" /> {r.crop}
                        </Link>
                      </td>
                      <td className="py-3 pr-3 text-slate-700">
                        {r.disease}
                        {r.pest && <span className="text-slate-500"> Â· {r.pest}</span>}
                      </td>
                      <td className="py-3 pr-3">
                        <RiskBadge level={r.riskLevel} />
                      </td>
                      <td className="py-3 pr-3">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="whitespace-nowrap py-3 text-right text-slate-600">{formatDate(r.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel title="Weather risk today" to="/farmer/risk" linkText="Details">
          <div className="px-4 pb-4 pt-3 sm:px-5">
            <RiskBadge level={weather.riskLevel} />
            <p className="mt-3 text-sm leading-relaxed text-slate-700">{weather.summary}</p>
            <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-center">
              {[
                { icon: Thermometer, value: `${weather.temperatureC}Â°C`, label: 'Temp' },
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

      {/* Map + alerts + follow-ups */}
      <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <Panel title="Nearby hotspots" to="/farmer/hotspots" linkText="Open map">
          <div className="mt-3 overflow-hidden border-y border-slate-200">
            <MapPreview farm={farm} hotspots={hotspots} className="h-72 sm:h-80" />
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-xs text-slate-600 sm:px-5">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Your farm
            </span>
            {MAP_LEGEND.map(([level, color]) => (
              <span key={level} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} /> {level} risk
              </span>
            ))}
            <span className="text-slate-400">Dashed = pest, solid = disease</span>
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel title="Alerts near you" to="/farmer/alerts">
            {alerts.length === 0 ? (
              <EmptyState icon={Bell} title="No active alerts" text="You are all clear for now." />
            ) : (
              <ul className="mt-2 divide-y divide-slate-100 px-4 pb-1 sm:px-5">
                {alerts.map((a) => (
                  <li key={a.id} className="flex items-start gap-3 py-3">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${SEVERITY_ICON[a.riskLevel]}`}>
                      <AlertTriangle className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900">{a.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {a.distanceKm > 0 ? `${a.distanceKm} km away` : 'Your farm'} Â· {a.crop} Â· {timeAgo(a.createdAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Follow-ups" to="/farmer/follow-ups">
            {followUps.length === 0 ? (
              <EmptyState icon={CalendarClock} title="No follow-ups" text="Follow-ups appear once a case is being monitored." />
            ) : (
              <ul className="mt-2 divide-y divide-slate-100 px-4 pb-1 sm:px-5">
                {followUps.map((f) => (
                  <li key={f.id} className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium text-slate-900">
                        {f.crop} <span className="font-normal text-slate-500">Â· {f.disease}</span>
                      </p>
                      <StatusBadge status={f.caseStatus} />
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {f.intervention}
                      {f.caseStatus === 'Active' && ` Â· Next check ${formatDate(f.nextFollowUp)}`}
                    </p>
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
            ['Get an AI check', 'Disease and pest detection with a confidence score.'],
            ['Expert validates', 'An agriculture expert confirms or corrects the result.'],
            ['Act and follow up', 'Follow the advisory in your language and track recovery.'],
          ].map(([title, text], i) => (
            <li key={title} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-800 text-xs font-bold text-white">{i + 1}</span>
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

