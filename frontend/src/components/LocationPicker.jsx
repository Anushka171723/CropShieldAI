import { useEffect, useState } from 'react'
import { CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import { Loader2, LocateFixed } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

const DEFAULT_CENTER = [18.5204, 73.8567] // Pune; used until the farmer picks a spot

function ClickToPin({ onPick, disabled }) {
  useMapEvents({
    click(e) {
      if (!disabled) onPick({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

function Recenter({ value }) {
  const map = useMap()
  const lat = value?.lat
  const lng = value?.lng
  useEffect(() => {
    if (lat != null) map.setView([lat, lng], Math.max(map.getZoom(), 14))
  }, [map, lat, lng])
  return null
}

// value: {lat, lng} | null. Farmer can use GPS or tap the map to drop a pin.
export default function LocationPicker({ value, onChange, error, disabled }) {
  const [locating, setLocating] = useState(false)
  const [gpsError, setGpsError] = useState('')

  const useGps = () => {
    setGpsError('')
    if (!navigator.geolocation) {
      setGpsError('GPS is not supported on this device. Tap the map to choose your location.')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocating(false)
      },
      (err) => {
        setLocating(false)
        setGpsError(
          err.code === err.PERMISSION_DENIED
            ? 'Location permission was denied. Tap the map to choose your location instead.'
            : 'Could not get your location. Tap the map to choose it instead.',
        )
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={useGps}
          disabled={disabled || locating}
          className="inline-flex items-center gap-2 rounded-lg border border-brand-600 bg-surface px-4 py-2 text-sm font-semibold text-brand-800 hover:bg-brand-50 disabled:opacity-60"
        >
          {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
          {locating ? 'Getting location...' : 'Use my current location'}
        </button>
        <span className="text-sm text-slate-500">
          {value ? `Selected: ${value.lat.toFixed(5)}, ${value.lng.toFixed(5)}` : 'or tap the map to drop a pin'}
        </span>
      </div>

      <div className={`overflow-hidden rounded-xl border ${error ? 'border-red-300' : 'border-slate-200'}`}>
        <MapContainer center={value ? [value.lat, value.lng] : DEFAULT_CENTER} zoom={value ? 14 : 9} scrollWheelZoom={false} className="h-72 w-full sm:h-80">
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <ClickToPin onPick={onChange} disabled={disabled} />
          <Recenter value={value} />
          {value && <CircleMarker center={[value.lat, value.lng]} radius={9} pathOptions={{ color: '#fff', weight: 3, fillColor: '#dc2626', fillOpacity: 1 }} />}
        </MapContainer>
      </div>

      {(gpsError || error) && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {gpsError || error}
        </p>
      )}
    </div>
  )
}
