import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertCircle, CheckCircle2, Leaf, Loader2, Send, Sparkles } from 'lucide-react'
import { RiskBadge, StatusBadge } from '../../components/Badges'
import FollowUpTimeline from '../../components/farmer/FollowUpTimeline'
import ImageUploader from '../../components/ImageUploader'
import PageContainer from '../../components/PageContainer'
import { EmptyState, ErrorState, LoadingState } from '../../components/StateViews'
import { getFollowUp, submitFollowUpUpdate } from '../../services/farmerService'
import { formatDate } from '../../utils/format'

const OUTCOMES = ['Improved', 'Unchanged', 'Worsened']

export default function FollowUpDetails() {
  const { id } = useParams()
  const [followUp, setFollowUp] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [outcome, setOutcome] = useState('')
  const [note, setNote] = useState('')
  const [image, setImage] = useState(null)
  const [imageError, setImageError] = useState('')
  const [formError, setFormError] = useState('')
  const [status, setStatus] = useState('idle') // idle | submitting | success
  const submitting = useRef(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setFollowUp(await getFollowUp(id))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const busy = status !== 'idle'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting.current) return
    setFormError('')
    if (!outcome) {
      setFormError('Select how the crop looks now.')
      return
    }

    submitting.current = true
    setStatus('submitting')
    try {
      const updated = await submitFollowUpUpdate(id, { outcome, note, image })
      setFollowUp(updated)
      setStatus('success')
      setOutcome('')
      setNote('')
      setImage(null)
      setTimeout(() => setStatus('idle'), 2500)
    } catch (err) {
      setFormError(err.message)
      setStatus('idle')
    } finally {
      submitting.current = false
    }
  }

  if (loading) return <LoadingState label="Loading follow-up..." />
  if (error) return <ErrorState message={error} onRetry={load} />
  if (!followUp) return <EmptyState icon={Leaf} title="Follow-up not found" text="This follow-up may have been removed, or the link is incorrect." />

  const { report } = followUp

  return (
    <PageContainer className="max-w-3xl space-y-6">
      <div>
        <p className="text-sm font-medium text-brand-700">Follow-up {followUp.id}</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{followUp.crop} follow-up</h1>
        <p className="mt-1 text-slate-600">Due {formatDate(followUp.dueDate)}</p>
      </div>

      {report && (
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-slate-900">Previous report & advisory</h2>
          <p className="mt-2 text-sm text-slate-700">{report.issue}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <RiskBadge level={report.riskLevel} />
            <StatusBadge status={report.reviewStatus} />
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-sm">
            <Link to={`/farmer/reports/${report.id}`} className="font-medium text-brand-700 hover:underline">
              View full report
            </Link>
            <Link to={`/farmer/reports/${report.id}/advisory`} className="font-medium text-brand-700 hover:underline">
              View advisory
            </Link>
          </div>
        </section>
      )}

      {/* Update form */}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold text-slate-900">Record an update</h2>

        {status === 'success' && (
          <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm text-emerald-800">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <p>Update saved to this demo's local state. It is not sent to a real server, and no expert has been notified.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">How does the crop look now?</p>
            <div role="radiogroup" aria-label="Symptom status" className="flex flex-wrap gap-2">
              {OUTCOMES.map((o) => (
                <button
                  key={o}
                  type="button"
                  role="radio"
                  aria-checked={outcome === o}
                  disabled={busy}
                  onClick={() => {
                    setOutcome(o)
                    setFormError('')
                  }}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                    outcome === o ? 'border-brand-700 bg-brand-700 text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-brand-400'
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="observations" className="mb-1.5 block text-sm font-medium text-slate-700">
              Additional observations <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              id="observations"
              rows={3}
              maxLength={500}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={busy}
              placeholder="e.g. Fewer spots on new leaves, but older leaves still affected"
              className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-[15px] text-slate-900 placeholder:text-slate-400 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </div>

          <div>
            <p className="mb-1.5 text-sm font-medium text-slate-700">
              New photo <span className="font-normal text-slate-400">(optional)</span>
            </p>
            <ImageUploader file={image} disabled={busy} error={imageError} onChange={setImage} onError={setImageError} />
          </div>

          {formError && (
            <div role="alert" className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="flex items-center justify-center gap-2 rounded-lg bg-brand-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {status === 'submitting' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving update...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" /> Submit update
              </>
            )}
          </button>
        </form>
      </section>

      {/* Timeline */}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="flex items-center gap-2 font-semibold text-slate-900">
          <Sparkles className="h-[18px] w-[18px] text-brand-700" /> Follow-up timeline
        </h2>
        <div className="mt-4">
          <FollowUpTimeline updates={followUp.updates} />
        </div>
      </section>

      {report && (
        <Link to={`/farmer/reports/${report.id}`} className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
          Back to report
        </Link>
      )}
    </PageContainer>
  )
}
