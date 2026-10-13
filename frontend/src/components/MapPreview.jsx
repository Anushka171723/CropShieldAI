import { Circle, CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const RISK_COLOR = { High: '#dc2626', Medium: '#f59e0b', Low: '#16a34a' }

export const MAP_LEGEND = Object.entries(RISK_COLOR)

// Read-only map: the farm as a blue dot and each backend hotspot as a risk-coloured zone.
export default function MapPreview({ farm, hotspots, className = 'h-72' }) {
  return (
    <MapContainer center={[farm.lat, farm.lng]} zoom={12} scrollWheelZoom={false} className={`w-full ${className}`}>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {hotspots.map((h) => (
        <Circle
          key={h.id}
          center={[h.lat, h.lng]}
          radius={h.radiusM}
          pathOptions={{ color: RISK_COLOR[h.riskLevel], fillColor: RISK_COLOR[h.riskLevel], fillOpacity: 0.25, weight: 2, dashArray: h.type === 'Pest' ? '6 4' : undefined }}
        >
          <Popup>
            <strong>{h.name}</strong> ({h.type.toLowerCase()})
            <br />
            {h.crop} · {h.cases} reports · {h.riskLevel} risk
            <br />
            {h.distanceKm} km from your farm
          </Popup>
        </Circle>
      ))}
      <CircleMarker center={[farm.lat, farm.lng]} radius={8} pathOptions={{ color: '#fff', weight: 3, fillColor: '#2563eb', fillOpacity: 1 }}>
        <Popup>Your farm</Popup>
      </CircleMarker>
    </MapContainer>
  )
}
