import { useCallback, useEffect, useState } from 'react'
import { Circle, CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { AlertTriangle, Bug, LocateFixed, Loader2, MapPin, Sparkles } from 'lucide-react'
import { RiskBadge } from '../../components/Badges'
import PageContainer from '../../components/PageContainer'
import { EmptyState, ErrorState, LoadingState } from '../../components/StateViews'
import { getFarmerProfile, getHotspotFilterOptions, getHotspots } from '../../services/farmerService'
import { formatDate } from '../../utils/format'

const RISK_COLOR = { High: '#dc2626', Medium: '#f59e0b', Low: '#16a34a' }
const DAYS_OPTIONS = [
  { value: '', label: 'Any time' },
  { value: '3', label: 'Last 3 days' },
  { value: '7', label: 'Last 7 days' },
  { value: '14', label: 'Last 14 days' },
]
const selectClass = 'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-200'

function Recenter({ center }) {
  const map = useMap()
  useEffect(() => {
    map.setView([center.lat, center.lng], map.getZoom())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center.lat, center.lng])
  return null
}

export default function NearbyHotspots() {
  const [profile, setProfile] = useState(null)
  const [hotspots, setHotspots] = useState([])
  const [filterOptions, setFilterOptions] = useState({ crops: [], types: [] })
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [crop, setCrop] = useState('All')
  const [type, setType] = useState('All')
  const [withinDays, setWithinDays] = useState('')

  // Device location is optional: falls back to the farm's registered location if denied or unavailable.
  const [deviceLocation, setDeviceLocation] = useState(null)
  const [locating, setLocating] = useState(false)
  const [locationNote, setLocationNote] = useState('')

  useEffect(() => {
    getFarmerProfile().then(setProfile)
    getHotspotFilterOptions().then(setFilterOptions)
  }, [])

  const center = deviceLocation || profile?.farm

  const load = useCallback(async () => {
    if (!center) return
    setLoading(true)
    setError('')
    try {
      const list = await getHotspots({ center, crop, type, withinDays: withinDays ? Number(withinDays) : null })
      setHotspots(list)
      setSelected((prev) => (prev && list.some((h) => h.id === prev.id) ? list.find((h) => h.id === prev.id) : null))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [center, crop, type, withinDays])

  useEffect(() => {
    load()
  }, [load])

  const useMyLocation = () => {
    setLocationNote('')
    if (!navigator.geolocation) {
      setLocationNote('Location is not available on this device. Showing hotspots around your registered farm instead.')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDeviceLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocating(false)
      },
      (err) => {
        setLocating(false)
        setLocationNote(
          err.code === err.PERMISSION_DENIED
            ? 'Location permission was denied. Showing hotspots around your registered farm instead.'
            : 'Could not get your location. Showing hotspots around your registered farm instead.',
        )
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  if (!profile || (loading && hotspots.length === 0 && !error)) return <LoadingState label="Loading nearby hotspots..." />
  if (error) return <ErrorState message={error} onRetry={load} />

  return (
    <PageContainer className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Nearby hotspots</h1>
        <p className="mt-1 text-slate-600">Disease and pest activity reported around your farm.</p>
      </div>

      <div className="flex items-start gap-2.5 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          <strong className="font-semibold">Illustrative demo data.</strong> These hotspot markers are fictional samples for this demo and do not represent real outbreaks.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:gap-4">
        <select value={crop} onChange={(e) => setCrop(e.target.value)} aria-label="Filter by crop" className={selectClass}>
          <option value="All">All crops</option>
          {filterOptions.crops.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Filter by disease or pest" className={selectClass}>
          <option value="All">Disease and pest</option>
          {filterOptions.types.map((t) => (
            <option key={t} value={t}>
              {t} only
            </option>
          ))}
        </select>

        <select value={withinDays} onChange={(e) => setWithinDays(e.target.value)} aria-label="Filter by date range" className={selectClass}>
          {DAYS_OPTIONS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>

        <button type="button" onClick={useMyLocation} disabled={locating} className="ml-auto inline-flex items-center gap-2 rounded-lg border border-brand-600 bg-white px-3.5 py-2 text-sm font-semibold text-brand-800 hover:bg-brand-50 disabled:opacity-60">
          {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
          {locating ? 'Locating...' : 'Use my location'}
        </button>
      </div>

      {locationNote && <p className="text-xs text-amber-700">{locationNote}</p>}

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        {/* Map */}
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <MapContainer center={[center.lat, center.lng]} zoom={11} scrollWheelZoom className="h-[420px] w-full sm:h-[520px]">
            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Recenter center={center} />

            {hotspots.map((h) => (
              <Circle
                key={h.id}
                center={[h.lat, h.lng]}
                radius={h.radiusM}
                eventHandlers={{ click: () => setSelected(h) }}
                pathOptions={{
                  color: RISK_COLOR[h.riskLevel],
                  fillColor: RISK_COLOR[h.riskLevel],
                  fillOpacity: selected?.id === h.id ? 0.45 : 0.22,
                  weight: selected?.id === h.id ? 3 : 2,
                  dashArray: h.type === 'Pest' ? '6 4' : undefined,
                }}
              >
                <Popup>
                  <strong>{h.name}</strong> ({h.type.toLowerCase()})
                  <br />
                  {h.crop} · {h.cases} reports · {h.riskLevel} risk
                  <br />
                  {h.distanceKm.toFixed(1)} km away
                </Popup>
              </Circle>
            ))}

            <CircleMarker center={[center.lat, center.lng]} radius={8} pathOptions={{ color: '#fff', weight: 3, fillColor: '#2563eb', fillOpacity: 1 }}>
              <Popup>{deviceLocation ? 'Your current location' : 'Your farm'}</Popup>
            </CircleMarker>
          </MapContainer>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-200 bg-white px-4 py-3 text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> {deviceLocation ? 'Your location' : 'Your farm'}
            </span>
            {Object.entries(RISK_COLOR).map(([level, color]) => (
              <span key={level} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} /> {level} risk
              </span>
            ))}
            <span className="text-slate-400">Dashed = pest, solid = disease</span>
          </div>
        </div>

        {/* List + selected detail */}
        <div className="space-y-4">
          {selected && (
            <div className="rounded-xl border border-brand-200 bg-brand-50 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="flex items-center gap-1.5 font-semibold text-brand-900">
                    {selected.type === 'Pest' ? <Bug className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />} {selected.name}
                  </p>
                  <p className="text-sm text-brand-900/80">{selected.crop}</p>
                </div>
                <RiskBadge level={selected.riskLevel} />
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm text-brand-900/90">
                <div>
                  <dt className="text-xs text-brand-700/70">Reports</dt>
                  <dd className="font-medium">{selected.cases}</dd>
                </div>
                <div>
                  <dt className="text-xs text-brand-700/70">Distance</dt>
                  <dd className="font-medium">{selected.distanceKm.toFixed(1)} km</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-xs text-brand-700/70">Last reported</dt>
                  <dd className="font-medium">{formatDate(selected.lastReportedAt)}</dd>
                </div>
              </dl>
            </div>
          )}

          <div className="rounded-xl border border-slate-200 bg-white">
            <h2 className="px-4 pt-4 font-semibold text-slate-900 sm:px-5">Hotspots near you ({hotspots.length})</h2>
            {hotspots.length === 0 ? (
              <EmptyState icon={MapPin} title="No hotspots match your filters" text="Try a different crop, type or date range." />
            ) : (
              <ul className="mt-2 max-h-[420px] divide-y divide-slate-100 overflow-y-auto px-4 pb-2 sm:px-5">
                {hotspots.map((h) => (
                  <li key={h.id}>
                    <button
                      type="button"
                      onClick={() => setSelected(h)}
                      className={`flex w-full items-center justify-between gap-3 py-3 text-left ${selected?.id === h.id ? 'text-brand-800' : 'text-slate-800'}`}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{h.name}</p>
                        <p className="truncate text-xs text-slate-500">{h.crop} · {h.distanceKm.toFixed(1)} km away</p>
                      </div>
                      <RiskBadge level={h.riskLevel} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
