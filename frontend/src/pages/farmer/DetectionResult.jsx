import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight, Bug, CheckCircle2, Clock, Leaf, ShieldAlert, Sparkles } from 'lucide-react'
import { RiskBadge } from '../../components/Badges'
import PageContainer from '../../components/PageContainer'
import { EmptyState, ErrorState, LoadingState } from '../../components/StateViews'
import { getDetection, getReport } from '../../services/farmerService'
import { formatDate, formatPercent } from '../../utils/format'

const REVIEW_COPY = {
  Pending: { text: 'Waiting for an agriculture expert to review this result.', tone: 'text-amber-700 bg-amber-50 border-amber-200' },
  Validated: { text: 'An agriculture expert has confirmed this result.', tone: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  Corrected: { text: 'An agriculture expert reviewed and corrected this result.', tone: 'text-sky-700 bg-sky-50 border-sky-200' },
}

export default function DetectionResult() {
  const { id } = useParams()
  const [report, setReport] = useState(null)
  const [detection, setDetection] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [r, d] = await Promise.all([getReport(id), getDetection(id)])
      setReport(r)
      setDetection(d)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  if (loading) return <LoadingState label="Loading detection result..." />
  if (error) return <ErrorState message={error} onRetry={load} />
  if (!report || !detection) {
    return <EmptyState icon={Leaf} title="Report not found" text="This report may have been removed, or the link is incorrect." />
  }

  const review = REVIEW_COPY[detection.reviewStatus] || REVIEW_COPY.Pending
  const isHealthy = detection.issueType === 'Healthy'

  return (
    <PageContainer className="max-w-4xl space-y-6">
      <div>
        <p className="text-sm font-medium text-brand-700">Report {report.id}</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">AI detection result</h1>
        <p className="mt-1 text-slate-600">Submitted {formatDate(report.submittedAt)} · {report.crop}{report.variety ? ` · ${report.variety}` : ''}</p>
      </div>

      <div className="flex items-start gap-2.5 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          <strong className="font-semibold">Simulated result.</strong> This is sample output for demonstration only. No real AI model has analysed this image.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-surface">
            {report.imageUrl ? (
              <img src={report.imageUrl} alt={`Submitted photo of ${report.crop}`} className="h-64 w-full bg-slate-100 object-cover" />
            ) : (
              <div className="flex h-64 items-center justify-center bg-slate-50 text-slate-400">
                <Leaf className="h-10 w-10" />
              </div>
            )}
            <div className="border-t border-slate-100 px-4 py-3 text-sm text-slate-600">
              <p>
                <span className="font-medium text-slate-800">Growth stage:</span> {report.growthStage}
              </p>
              {report.symptoms?.length > 0 && (
                <p className="mt-1">
                  <span className="font-medium text-slate-800">Symptoms reported:</span> {report.symptoms.join(', ')}
                </p>
              )}
            </div>
          </div>

          <div className={`rounded-lg border px-4 py-3 text-sm ${review.tone}`}>
            <p className="flex items-center gap-2 font-semibold">
              <ShieldAlert className="h-4 w-4" /> Expert validation: {detection.reviewStatus}
            </p>
            <p className="mt-1">{review.text}</p>
          </div>
        </div>

        <div className="space-y-5">
          <section className="rounded-xl border border-slate-200 bg-surface p-5">
            <h2 className="font-semibold text-slate-900">
              {isHealthy ? (
                <span className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle2 className="h-5 w-5" /> No issue detected
                </span>
              ) : (
                'Disease classification'
              )}
            </h2>
            <p className="mt-2 text-lg font-semibold text-slate-900">{detection.issue}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <RiskBadge level={detection.riskLevel} />
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                Confidence: {formatPercent(detection.confidence)}
                <span className="rounded bg-amber-100 px-1 text-[10px] font-semibold uppercase text-amber-700">Simulated</span>
              </span>
            </div>
          </section>

          {detection.pest && (
            <section className="rounded-xl border border-slate-200 bg-surface p-5">
              <h2 className="flex items-center gap-2 font-semibold text-slate-900">
                <Bug className="h-[18px] w-[18px] text-brand-700" /> Pest finding
              </h2>
              <p className="mt-2 text-slate-800">
                Visual indicators consistent with <span className="font-semibold">{detection.pest}</span> activity were noted alongside the disease symptoms.
              </p>
            </section>
          )}

          <section className="rounded-xl border border-slate-200 bg-surface p-5">
            <h2 className="font-semibold text-slate-900">Detection summary</h2>
            <p className="mt-2 leading-relaxed text-slate-700">{detection.summary}</p>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
              <Clock className="h-3.5 w-3.5" /> Generated {formatDate(detection.submittedAt)} · sample data, not a live model
            </p>
          </section>

          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              to={`/farmer/reports/${report.id}/risk`}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-surface px-4 py-3.5 text-sm font-semibold text-slate-800 hover:border-brand-400 hover:bg-brand-50/50"
            >
              View risk assessment <ArrowRight className="h-4 w-4 text-brand-700" />
            </Link>
            <Link
              to={`/farmer/reports/${report.id}/advisory`}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-surface px-4 py-3.5 text-sm font-semibold text-slate-800 hover:border-brand-400 hover:bg-brand-50/50"
            >
              View crop advisory <ArrowRight className="h-4 w-4 text-brand-700" />
            </Link>
          </div>

          <Link to={`/farmer/reports/${report.id}`} className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
            Back to full report details
          </Link>
        </div>
      </div>
    </PageContainer>
  )
}
