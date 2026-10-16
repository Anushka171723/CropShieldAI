import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, CheckCircle2, Globe, Loader2, LogOut, MapPin, Save, Sprout, User } from 'lucide-react'
import PageContainer from '../../components/PageContainer'
import { ErrorState, LoadingState } from '../../components/StateViews'
import { ADVISORY_LANGUAGES } from '../../data/advisoryContent'
import { useAuth } from '../../hooks/useAuth'
import { getFarmerProfile, updateFarmerProfile } from '../../services/farmerService'
import { CROPS } from '../../utils/cropOptions'
import { ROLE_LABEL } from '../../utils/roles'

const NOTIFICATION_TOGGLES = [
  { key: 'weatherAlerts', label: 'Weather alerts', hint: 'Sample alerts about conditions that favour disease or pests.' },
  { key: 'hotspotAlerts', label: 'Nearby hotspot alerts', hint: 'When a disease or pest hotspot is reported near your farm.' },
  { key: 'expertReviewUpdates', label: 'Expert review updates', hint: 'When an expert confirms or corrects one of your reports.' },
  { key: 'followUpReminders', label: 'Follow-up reminders', hint: 'When a follow-up on one of your cases is due.' },
]

const fieldClass = 'block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-[15px] text-slate-900 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-200'

function Toggle({ checked, onChange, disabled, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 ${checked ? 'bg-brand-700' : 'bg-slate-300'} disabled:opacity-60`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${checked ? 'left-5' : 'left-0.5'}`} />
    </button>
  )
}

function Section({ icon: Icon, title, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="flex items-center gap-2 font-semibold text-slate-900">
        <Icon className="h-[18px] w-[18px] text-brand-700" /> {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  )
}

export default function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saveStatus, setSaveStatus] = useState('idle') // idle | saving | saved | error
  const [loggingOut, setLoggingOut] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setProfile(await getFarmerProfile())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const set = (field) => (value) => setProfile((p) => ({ ...p, [field]: value }))
  const setNotification = (key) => (value) => setProfile((p) => ({ ...p, notifications: { ...p.notifications, [key]: value } }))
  const toggleCrop = (crop) =>
    setProfile((p) => ({ ...p, crops: p.crops.includes(crop) ? p.crops.filter((c) => c !== crop) : [...p.crops, crop] }))

  const handleSave = async (e) => {
    e.preventDefault()
    setSaveStatus('saving')
    try {
      const saved = await updateFarmerProfile(profile)
      setProfile(saved)
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch {
      setSaveStatus('error')
    }
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    await logout()
    navigate('/login', { replace: true })
  }

  if (loading) return <LoadingState label="Loading your profile..." />
  if (error) return <ErrorState message={error} onRetry={load} />

  return (
    <PageContainer className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Profile & settings</h1>
        <p className="mt-1 text-slate-600">Your account details and preferences for this demo.</p>
      </div>

      <div className="flex items-start gap-2.5 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <p>This is a fictional demo profile. Changes are saved to your browser only and nothing is sent to a real server.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Section icon={User} title="Personal details">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700">
                Full name
              </label>
              <input id="name" value={profile.name} onChange={(e) => set('name')(e.target.value)} required className={fieldClass} />
            </div>
            <div>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-slate-700">
                Phone number
              </label>
              <input id="phone" value={profile.phone} onChange={(e) => set('phone')(e.target.value)} required className={fieldClass} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input id="email" type="email" value={profile.email} disabled className={`${fieldClass} cursor-not-allowed bg-slate-50 text-slate-500`} />
              <p className="mt-1 text-xs text-slate-400">Email is tied to your account and cannot be changed here.</p>
            </div>
          </div>
        </Section>

        <Section icon={MapPin} title="Farm location">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="village" className="mb-1.5 block text-sm font-medium text-slate-700">
                Village
              </label>
              <input id="village" value={profile.village} onChange={(e) => set('village')(e.target.value)} className={fieldClass} />
            </div>
            <div>
              <label htmlFor="district" className="mb-1.5 block text-sm font-medium text-slate-700">
                District
              </label>
              <input id="district" value={profile.district} onChange={(e) => set('district')(e.target.value)} className={fieldClass} />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Registered farm: {profile.farm.name} · {profile.farm.areaAcres} acres · {profile.farm.lat.toFixed(4)}, {profile.farm.lng.toFixed(4)}
          </p>
        </Section>

        <Section icon={Sprout} title="Crop preferences">
          <p className="mb-3 text-sm text-slate-600">Crops you usually grow. Used to tailor hotspot and advisory filters.</p>
          <div role="group" aria-label="Crop preferences" className="flex flex-wrap gap-2">
            {CROPS.filter((c) => c !== 'Other').map((crop) => {
              const on = profile.crops.includes(crop)
              return (
                <button
                  key={crop}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleCrop(crop)}
                  className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                    on ? 'border-brand-700 bg-brand-700 text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-brand-400'
                  }`}
                >
                  {crop}
                </button>
              )
            })}
          </div>
        </Section>

        <Section icon={Globe} title="Preferred language">
          <p className="mb-3 text-sm text-slate-600">Used as the default language for crop advisories.</p>
          <div className="flex flex-wrap gap-2">
            {ADVISORY_LANGUAGES.map((l) => (
              <button
                key={l.code}
                type="button"
                aria-pressed={profile.language === l.code}
                onClick={() => set('language')(l.code)}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                  profile.language === l.code ? 'border-brand-700 bg-brand-700 text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-brand-400'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
          {profile.language !== 'en' && <p className="mt-2 text-xs text-amber-700">Advisories currently display in English only; see your preference saved here for when translations are added.</p>}
        </Section>

        <Section icon={AlertCircle} title="Notification preferences">
          <ul className="divide-y divide-slate-100">
            {NOTIFICATION_TOGGLES.map(({ key, label, hint }) => (
              <li key={key} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-slate-900">{label}</p>
                  <p className="text-xs text-slate-500">{hint}</p>
                </div>
                <Toggle checked={profile.notifications[key]} onChange={setNotification(key)} label={label} />
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-slate-400">These control what you see on the Alerts page in this demo. No real push notifications or SMS are sent.</p>
        </Section>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saveStatus === 'saving'}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saveStatus === 'saving' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Save changes
              </>
            )}
          </button>
          {saveStatus === 'saved' && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-700">
              <CheckCircle2 className="h-4 w-4" /> Saved to this browser
            </span>
          )}
          {saveStatus === 'error' && <span className="text-sm font-medium text-red-600">Could not save. Please try again.</span>}
        </div>
      </form>

      <Section icon={User} title="Account">
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs text-slate-500">Role</dt>
            <dd className="font-medium text-slate-900">{ROLE_LABEL[user.role]}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Signed in as</dt>
            <dd className="font-medium text-slate-900">{user.email}</dd>
          </div>
        </dl>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          {loggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
          Log out
        </button>
      </Section>
    </PageContainer>
  )
}
