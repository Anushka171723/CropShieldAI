import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight, CloudRain, Droplets, Leaf, ShieldCheck, Sparkles, Thermometer } from 'lucide-react'
import { RiskBadge } from '../../components/Badges'
import PageContainer from '../../components/PageContainer'
import { EmptyState, ErrorState, LoadingState } from '../../components/StateViews'
import { getRiskAssessment } from '../../services/farmerService'
import { formatDate } from '../../utils/format'

const WEIGHT_DOT = { High: 'bg-red-500', Medium: 'bg-amber-500', Low: 'bg-emerald-500' }

export default function RiskAssessment() {
  const { id } = useParams()
  const [risk, setRisk] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setRisk(await getRiskAssessment(id))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  if (loading) return <LoadingState label="Loading risk assessment..." />
  if (error) return <ErrorState message={error} onRetry={load} />
  if (!risk) return <EmptyState icon={Leaf} title="Report not found" text="This report may have been removed, or the link is incorrect." />

  const { weatherContext: w } = risk

  return (
    <PageContainer className="max-w-4xl space-y-6">
      <div>
        <p className="text-sm font-medium text-brand-700">Report {risk.reportId}</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Risk assessment</h1>
        <p className="mt-1 text-slate-600">{risk.crop} · {risk.issue}</p>
      </div>

      <div className="flex items-start gap-2.5 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          <strong className="font-semibold">Sample forecast.</strong> Weather and risk figures here are illustrative demo data, not a live forecast or model output.
        </p>
      </div>

      {/* Headline risk */}
      <section className="rounded-xl border border-slate-200 bg-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-500">Crop-health risk level</p>
            <div className="mt-1.5">
              <RiskBadge level={risk.riskLevel} />
            </div>
          </div>
          <p className="text-xs text-slate-400">Last updated {formatDate(risk.lastUpdated)} · sample data</p>
        </div>
        <p className="mt-4 leading-relaxed text-slate-700">{risk.explanation}</p>
      </section>

      {/* Weather context */}
      <section className="rounded-xl border border-slate-200 bg-surface p-5">
        <h2 className="font-semibold text-slate-900">Sample weather context</h2>
        <dl className="mt-4 grid grid-cols-3 gap-3 text-center sm:grid-cols-4">
          {[
            { icon: Thermometer, value: `${w.temperatureC}°C`, label: 'Temperature' },
            { icon: Droplets, value: `${w.humidity}%`, label: 'Humidity' },
            { icon: CloudRain, value: `${w.rainfallMm} mm`, label: 'Rainfall' },
            { icon: Leaf, value: w.condition, label: 'Condition' },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="rounded-lg bg-slate-50 px-2 py-3">
              <Icon className="mx-auto h-4 w-4 text-slate-400" />
              <dd className="mt-1 text-sm font-semibold text-slate-900">{value}</dd>
              <dt className="text-xs text-slate-500">{label}</dt>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-xs text-slate-400">{w.location} · sample forecast, not a live weather feed.</p>
      </section>

      {/* Contributing factors */}
      <section className="rounded-xl border border-slate-200 bg-surface p-5">
        <h2 className="font-semibold text-slate-900">Why the risk may be elevated</h2>
        <ul className="mt-3 space-y-3">
          {risk.factors.map((f, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${WEIGHT_DOT[f.weight] || WEIGHT_DOT.Low}`} />
              <div>
                <p className="text-sm font-medium text-slate-900">{f.label}</p>
                <p className="text-sm text-slate-600">{f.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Preventive actions */}
      <section className="rounded-xl border border-slate-200 bg-surface p-5">
        <h2 className="flex items-center gap-2 font-semibold text-slate-900">
          <ShieldCheck className="h-[18px] w-[18px] text-brand-700" /> Suggested preventive actions
        </h2>
        <ul className="mt-3 space-y-2">
          {risk.preventiveActions.map((a, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />
              {a}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-slate-400">General, cautious guidance only. Not a confirmed treatment plan.</p>
      </section>

      <Link
        to={`/farmer/reports/${risk.reportId}/advisory`}
        className="flex items-center justify-between rounded-lg border border-slate-200 bg-surface px-4 py-3.5 text-sm font-semibold text-slate-800 hover:border-brand-400 hover:bg-brand-50/50"
      >
        View crop advisory <ArrowRight className="h-4 w-4 text-brand-700" />
      </Link>

      <Link to={`/farmer/reports/${risk.reportId}/detection`} className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
        Back to detection result
      </Link>
    </PageContainer>
  )
}
