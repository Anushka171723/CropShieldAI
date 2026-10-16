import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, CheckCircle2, Lightbulb, Loader2, Send } from 'lucide-react'
import ImageUploader from '../../components/ImageUploader'
import LocationPicker from '../../components/LocationPicker'
import PageContainer from '../../components/PageContainer'
import { createReport } from '../../services/farmerService'
import { CROPS, GROWTH_STAGES, SYMPTOMS, VARIETIES } from '../../utils/cropOptions'

const initial = { crop: '', variety: '', growthStage: '', symptoms: [], symptomStart: '', notes: '' }

const fieldClass = (error) =>
  `block w-full rounded-lg border bg-white px-3.5 py-2.5 text-[15px] text-slate-900 placeholder:text-slate-400 transition focus:outline-none focus:ring-2 ${
    error ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-brand-600 focus:ring-brand-200'
  }`

function Field({ label, htmlFor, error, optional, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label} {optional && <span className="font-normal text-slate-400">(optional)</span>}
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

function Step({ number, title, children }) {
  return (
    <section className="border-t border-slate-200 py-7 first:border-t-0 first:pt-0">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-800 text-sm font-semibold text-white">{number}</span>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      </div>
      {children}
    </section>
  )
}

export default function NewReport() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initial)
  const [image, setImage] = useState(null)
  const [location, setLocation] = useState(null)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [status, setStatus] = useState('idle') // idle | submitting | success
  const submitting = useRef(false) // guards against double-clicks before state updates land

  const busy = status !== 'idle'
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  const clearError = (key) => setErrors((prev) => ({ ...prev, [key]: undefined }))

  const toggleSymptom = (s) =>
    setForm((f) => ({ ...f, symptoms: f.symptoms.includes(s) ? f.symptoms.filter((x) => x !== s) : [...f.symptoms, s] }))

  const validate = () => {
    const next = {}
    if (!form.crop) next.crop = 'Select your crop.'
    if (!form.growthStage) next.growthStage = 'Select the growth stage.'
    if (form.symptoms.length === 0 && !form.notes.trim()) next.symptoms = 'Select at least one symptom or describe what you see.'
    if (!image) next.image = next.image || 'Add a clear photo of the affected crop.'
    if (!location) next.location = 'Share or pick the location of your field.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting.current) return
    setSubmitError('')
    if (!validate()) {
      // wait for the error messages to render, then bring the first one into view
      setTimeout(() => document.querySelector('form [role="alert"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0)
      return
    }

    submitting.current = true
    setStatus('submitting')
    try {
      const { id } = await createReport({ ...form, notes: form.notes.trim(), location, image })
      setStatus('success')
      setTimeout(() => navigate(`/farmer/reports/${id}/detection`, { state: { justSubmitted: true } }), 1200)
    } catch (err) {
      setSubmitError(err.message)
      setStatus('idle')
      submitting.current = false
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    }
  }

  const varieties = VARIETIES[form.crop] || []

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">New crop report</h1>
        <p className="mt-1 text-slate-600">Tell us about your crop and add a photo. Our AI will check it for diseases and pests.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <form onSubmit={handleSubmit} noValidate className="rounded-xl border border-slate-200 bg-white p-5 sm:p-7">
          <Step number="1" title="Crop details">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Crop" htmlFor="crop" error={errors.crop}>
                <select
                  id="crop"
                  value={form.crop}
                  disabled={busy}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, crop: e.target.value, variety: '' }))
                    clearError('crop')
                  }}
                  className={fieldClass(errors.crop)}
                >
                  <option value="">Select crop</option>
                  {CROPS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Variety" htmlFor="variety" optional>
                <input id="variety" list="variety-list" placeholder="Type or pick" value={form.variety} onChange={set('variety')} disabled={busy} className={fieldClass()} />
                <datalist id="variety-list">
                  {varieties.map((v) => (
                    <option key={v} value={v} />
                  ))}
                </datalist>
              </Field>
              <Field label="Growth stage" htmlFor="stage" error={errors.growthStage}>
                <select
                  id="stage"
                  value={form.growthStage}
                  disabled={busy}
                  onChange={(e) => {
                    set('growthStage')(e)
                    clearError('growthStage')
                  }}
                  className={fieldClass(errors.growthStage)}
                >
                  <option value="">Select stage</option>
                  {GROWTH_STAGES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
            </div>
          </Step>

          <Step number="2" title="What symptoms do you see?">
            <div role="group" aria-label="Symptoms" className="flex flex-wrap gap-2">
              {SYMPTOMS.map((s) => {
                const on = form.symptoms.includes(s)
                return (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={on}
                    disabled={busy}
                    onClick={() => {
                      toggleSymptom(s)
                      clearError('symptoms')
                    }}
                    className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                      on ? 'border-brand-700 bg-brand-700 text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-brand-400'
                    }`}
                  >
                    {s}
                  </button>
                )
              })}
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_220px]">
              <Field label="Anything else you noticed?" htmlFor="notes" optional error={errors.symptoms}>
                <textarea
                  id="notes"
                  rows={3}
                  maxLength={500}
                  placeholder="e.g. Spots started on lower leaves 3 days ago after rain"
                  value={form.notes}
                  onChange={(e) => {
                    set('notes')(e)
                    clearError('symptoms')
                  }}
                  disabled={busy}
                  className={fieldClass(errors.symptoms)}
                />
              </Field>
              <Field label="Symptoms first noticed on" htmlFor="symptomStart" optional>
                <input
                  id="symptomStart"
                  type="date"
                  max={new Date().toISOString().slice(0, 10)}
                  value={form.symptomStart}
                  onChange={set('symptomStart')}
                  disabled={busy}
                  className={fieldClass()}
                />
              </Field>
            </div>
          </Step>

          <Step number="3" title="Crop or leaf photo">
            <ImageUploader
              file={image}
              disabled={busy}
              error={errors.image}
              onChange={(f) => {
                setImage(f)
                if (f) clearError('image')
              }}
              onError={(msg) => setErrors((prev) => ({ ...prev, image: msg || undefined }))}
            />
          </Step>

          <Step number="4" title="Field location">
            <LocationPicker
              value={location}
              disabled={busy}
              error={errors.location}
              onChange={(loc) => {
                setLocation(loc)
                clearError('location')
              }}
            />
          </Step>

          {submitError && (
            <div role="alert" className="mb-4 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className={`flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-[15px] font-semibold text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 ${
              status === 'success' ? 'bg-emerald-600' : 'bg-brand-800 hover:bg-brand-900 disabled:opacity-70'
            } disabled:cursor-not-allowed`}
          >
            {status === 'submitting' && (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Analysing your crop...
              </>
            )}
            {status === 'success' && (
              <>
                <CheckCircle2 className="h-4 w-4" /> Report submitted. Opening result...
              </>
            )}
            {status === 'idle' && (
              <>
                <Send className="h-4 w-4" /> Submit report
              </>
            )}
          </button>
        </form>

        <aside className="h-fit lg:sticky lg:top-20">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="flex items-center gap-2 font-semibold text-amber-900">
              <Lightbulb className="h-[18px] w-[18px]" /> Tips for a good photo
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-amber-900/90">
              <li>Take it in daylight, avoid harsh shadows.</li>
              <li>Fill the frame with the affected leaf or pest.</li>
              <li>Keep the camera steady and in focus.</li>
              <li>Include both healthy and affected parts if you can.</li>
            </ul>
          </div>
          <p className="mt-4 px-1 text-xs leading-relaxed text-slate-500">
            Your location is used only to check local weather and nearby disease activity. An agriculture expert will review the AI result.
          </p>
        </aside>
      </div>
    </PageContainer>
  )
}
