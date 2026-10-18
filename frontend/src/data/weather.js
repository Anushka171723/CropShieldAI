import { daysFromNow } from './seedDates'

// SAMPLE weather. It is not fetched from any weather service.
export const sampleWeather = {
  location: 'Dindori, Nashik',
  updatedAt: daysFromNow(-0.05),
  temperatureC: 29,
  humidity: 78,
  rainfallMm: 12,
  windKmh: 11,
  condition: 'Partly cloudy',
  forecast: [
    { day: 'Tomorrow', tempC: 30, rainChance: 40, humidity: 80 },
    { day: 'In 2 days', tempC: 28, rainChance: 60, humidity: 84 },
    { day: 'In 3 days', tempC: 27, rainChance: 30, humidity: 76 },
  ],
}
