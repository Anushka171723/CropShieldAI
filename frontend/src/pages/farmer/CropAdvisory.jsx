import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight, Globe, Leaf, ListChecks, ShieldAlert, ShieldCheck, Sparkles } from 'lucide-react'
import PageContainer from '../../components/PageContainer'
import { EmptyState, ErrorState, LoadingState } from '../../components/StateViews'
import { ADVISORY_LANGUAGES } from '../../data/advisoryContent'
import { getAdvisory } from '../../services/farmerService'

const REVIEW_COPY = {
  Pending: { text: 'Treat this guidance as general awareness only until an expert reviews your report.', tone: 'text-amber-700 bg-amber-50 border-amber-200' },
  Validated: { text: 'An agriculture expert has confirmed the finding behind this guidance.', tone: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  Corrected: { text: 'An agriculture expert corrected the finding behind this guidance. Read it carefully.', tone: 'text-sky-700 bg-sky-50 border-sky-200' },
}

export default function CropAdvisory() {
  const { id } = useParams()
  const [advisory, setAdvisory] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [language, setLanguage] = useState('en')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setAdvisory(await getAdvisory(id))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  if (loading) return <LoadingState label="Loading advisory..." />
  if (error) return <ErrorState message={error} onRetry={load} />
  if (!advisory) return <EmptyState icon={Leaf} title="Report not found" text="This report may have been removed, or the link is incorrect." />

  const review = REVIEW_COPY[advisory.reviewStatus] || REVIEW_COPY.Pending

  return (
    <PageContainer className="max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-brand-700">Report {advisory.reportId}</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Crop advisory</h1>
          <p className="mt-1 text-slate-600">{advisory.crop} · {advisory.issue}</p>
        </div>

        {/* Language selector: UI only today. Only English copy exists; other languages note that and fall back. */}
        <label className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
          <Globe className="h-4 w-4 text-slate-500" />
          <select value={language} onChange={(e) => setLanguage(e.target.value)} aria-label="Advisory language" className="bg-transparent text-sm font-medium text-slate-800 focus:outline-none">
            {ADVISORY_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {language !== 'en' && (
        <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Translated advisories are not available in this demo yet. Showing English guidance below; the language you picked will be remembered once translations are added.</p>
        </div>
      )}

      <div className={`rounded-lg border px-4 py-3 text-sm ${review.tone}`}>
        <p className="flex items-center gap-2 font-semibold">
          <ShieldAlert className="h-4 w-4" /> Expert validation: {advisory.reviewStatus}
        </p>
        <p className="mt-1">{review.text}</p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="flex items-center gap-2 font-semibold text-slate-900">
          <ShieldCheck className="h-[18px] w-[18px] text-brand-700" /> General preventive measures
        </h2>
        <ul className="mt-3 space-y-2">
          {advisory.generalMeasures.map((m, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />
              {m}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="flex items-center gap-2 font-semibold text-slate-900">
          <ListChecks className="h-[18px] w-[18px] text-brand-700" /> Recommended next steps
        </h2>
        <ol className="mt-3 space-y-2">
          {advisory.nextSteps.map((s, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[11px] font-bold text-brand-800">{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-xl border border-amber-200 bg-amber-50 p-5">
        <h2 className="font-semibold text-amber-900">Safe crop-care information</h2>
        <p className="mt-2 text-sm leading-relaxed text-amber-900/90">{advisory.safeCareNote}</p>
      </section>

      <Link
        to={`/farmer/reports/${advisory.reportId}`}
        className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-800 hover:border-brand-400 hover:bg-brand-50/50"
      >
        Back to related report <ArrowRight className="h-4 w-4 text-brand-700" />
      </Link>
    </PageContainer>
  )
}
