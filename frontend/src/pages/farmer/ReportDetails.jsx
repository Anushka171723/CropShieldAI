import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight, Bug, CalendarClock, Leaf, MapPin, ScanSearch, ShieldAlert, Sparkles } from 'lucide-react'
import { RiskBadge, StatusBadge } from '../../components/Badges'
import PageContainer from '../../components/PageContainer'
import { EmptyState, ErrorState, LoadingState } from '../../components/StateViews'
import { getFollowUpsForReport, getReport } from '../../services/farmerService'
import { formatDate } from '../../utils/format'

function Section({ title, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="font-semibold text-slate-900">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  )
}

export default function ReportDetails() {
  const { id } = useParams()
  const [report, setReport] = useState(null)
  const [followUps, setFollowUps] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [r, f] = await Promise.all([getReport(id), getFollowUpsForReport(id)])
      setReport(r)
      setFollowUps(f)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  if (loading) return <LoadingState label="Loading report..." />
  if (error) return <ErrorState message={error} onRetry={load} />
  if (!report) return <EmptyState icon={Leaf} title="Report not found" text="This report may have been removed, or the link is incorrect." />

  return (
    <PageContainer className="max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-brand-700">Report {report.id}</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{report.crop}{report.variety ? ` · ${report.variety}` : ''}</h1>
          <p className="mt-1 text-slate-600">Submitted {formatDate(report.submittedAt)}</p>
        </div>
        <StatusBadge status={report.caseStatus} />
      </div>

      {report.isDemoSubmission && (
        <div className="flex items-start gap-2.5 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
          <p>This report was created in this demo session. Its detection, risk and advisory are simulated sample results.</p>
        </div>
      )}

      {/* Crop info + image */}
      <Section title="Crop information">
        <div className="grid gap-5 sm:grid-cols-[160px_1fr]">
          <div className="h-32 w-full overflow-hidden rounded-lg bg-slate-100 sm:h-full">
            {report.imageUrl ? (
              <img src={report.imageUrl} alt={`${report.crop} photo`} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400">
                <Leaf className="h-8 w-8" />
              </div>
            )}
          </div>
          <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs text-slate-500">Growth stage</dt>
              <dd className="font-medium text-slate-900">{report.growthStage}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Plot</dt>
              <dd className="font-medium text-slate-900">{report.plot}</dd>
            </div>
            {report.location && (
              <div>
                <dt className="text-xs text-slate-500">Location</dt>
                <dd className="flex items-center gap-1 font-medium text-slate-900">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" /> {report.location.lat.toFixed(3)}, {report.location.lng.toFixed(3)}
                </dd>
              </div>
            )}
            <div className="col-span-2 sm:col-span-3">
              <dt className="text-xs text-slate-500">Symptoms reported</dt>
              <dd className="font-medium text-slate-900">{report.symptoms?.length ? report.symptoms.join(', ') : 'None selected'}</dd>
            </div>
            {report.notes && (
              <div className="col-span-2 sm:col-span-3">
                <dt className="text-xs text-slate-500">Notes</dt>
                <dd className="text-slate-800">{report.notes}</dd>
              </div>
            )}
          </dl>
        </div>
      </Section>

      {/* Detection + risk summary */}
      <div className="grid gap-5 sm:grid-cols-2">
        <Section title="Detection summary">
          <p className="font-semibold text-slate-900">{report.issue}</p>
          {report.pest && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
              <Bug className="h-3.5 w-3.5" /> Possible {report.pest.toLowerCase()} activity
            </p>
          )}
          <Link to={`/farmer/reports/${report.id}/detection`} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
            <ScanSearch className="h-3.5 w-3.5" /> View full detection result
          </Link>
        </Section>

        <Section title="Risk summary">
          <RiskBadge level={report.riskLevel} />
          <Link to={`/farmer/reports/${report.id}/risk`} className="mt-3 flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
            View full risk assessment
          </Link>
        </Section>
      </div>

      {/* Expert review + advisory status */}
      <div className="grid gap-5 sm:grid-cols-2">
        <Section title="Expert review status">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-slate-400" />
            <StatusBadge status={report.reviewStatus} />
          </div>
        </Section>

        <Section title="Advisory">
          <Link to={`/farmer/reports/${report.id}/advisory`} className="flex items-center justify-between text-sm font-medium text-brand-700 hover:underline">
            View crop advisory <ArrowRight className="h-4 w-4" />
          </Link>
        </Section>
      </div>

      {/* Follow-up timeline */}
      <Section title="Follow-up timeline">
        {followUps.length === 0 ? (
          <EmptyState icon={CalendarClock} title="No follow-ups yet" text="A follow-up will be scheduled once this case is reviewed." />
        ) : (
          <div className="space-y-4">
            {followUps.map((f) => (
              <div key={f.id} className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-slate-900">Due {formatDate(f.dueDate)}</p>
                  <p className="mt-0.5 text-sm text-slate-600">{f.lastUpdate}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <StatusBadge status={f.status} />
                  <Link to={`/farmer/follow-ups/${f.id}`} className="text-xs font-medium text-brand-700 hover:underline">
                    Open follow-up
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Link to="/farmer/reports" className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
        Back to my reports
      </Link>
    </PageContainer>
  )
}
