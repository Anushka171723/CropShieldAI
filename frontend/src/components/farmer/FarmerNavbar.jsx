import { useEffect, useState } from 'react'
import { CloudSun, MapPin } from 'lucide-react'
import { getWeather } from '../../services/farmerService'
import TopNavbar from '../nav/TopNavbar'

// The shared top navigation plus the farmer's location and (sample) weather.
export default function FarmerNavbar() {
  const [weather, setWeather] = useState(null)

  useEffect(() => {
    let active = true
    getWeather()
      .then((w) => active && setWeather(w))
      .catch(() => {}) // the chip is optional, so a failure just hides it
    return () => {
      active = false
    }
  }, [])

  return (
    <TopNavbar
      extra={
        weather && (
          <div className="hidden items-center gap-3 text-sm text-slate-600 xl:flex" title="Sample weather data, not a live forecast">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4 text-red-500" /> {weather.location}
            </span>
            <span className="flex items-center gap-1">
              <CloudSun className="h-[18px] w-[18px] text-amber-500" /> {weather.temperatureC}°C
              <span className="rounded bg-amber-50 px-1 text-[10px] font-semibold uppercase text-amber-700">Sample</span>
            </span>
          </div>
        )
      }
    />
  )
}
