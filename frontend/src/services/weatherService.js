import api, { USE_MOCK, mockDelay } from './api'

// Mock for the navbar's location + weather chip. Real source TBD with Member 2 (weather comes from their API).
export async function getCurrentWeather() {
  if (USE_MOCK) {
    await mockDelay(300)
    return { location: 'Pune, MH', temperatureC: 28, humidity: 78, condition: 'Partly cloudy' }
  }
  try {
    const { data } = await api.get('/weather/current')
    return data
  } catch {
    return null // the navbar simply hides the chip if weather is unavailable
  }
}
