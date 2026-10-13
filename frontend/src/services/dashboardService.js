import api, { USE_MOCK, mockDelay } from './api'

const daysFromNow = (d) => new Date(Date.now() + d * 864e5).toISOString()

// Mock shaped like the expected GET /api/dashboard response for a farmer (confirm final shape with Member 2).
const MOCK_FARMER_DASHBOARD = {
  stats: { totalReports: 12, pendingReviews: 3, highRisk: 3, activeAlerts: 2 },
  weather: {
    location: 'Pune, MH',
    temperatureC: 28,
    humidity: 78,
    rainfallMm: 12,
    riskLevel: 'High',
    summary: 'Warm and humid conditions favour Early Blight on tomato over the next 3 days.',
  },
  farm: { lat: 18.5204, lng: 73.8567 },
  hotspots: [
    { id: 'h-1', type: 'Disease', name: 'Early Blight', crop: 'Tomato', lat: 18.5398, lng: 73.8791, radiusM: 1800, cases: 7, riskLevel: 'High', distanceKm: 2 },
    { id: 'h-2', type: 'Pest', name: 'Aphid', crop: 'Chilli', lat: 18.4921, lng: 73.8302, radiusM: 1400, cases: 4, riskLevel: 'Medium', distanceKm: 5 },
    { id: 'h-3', type: 'Disease', name: 'Powdery Mildew', crop: 'Onion', lat: 18.5602, lng: 73.7954, radiusM: 1100, cases: 3, riskLevel: 'Low', distanceKm: 8 },
  ],
  recentPredictions: [
    { id: 'r-1012', crop: 'Tomato', disease: 'Early Blight', confidence: 0.91, pest: 'Aphid', riskLevel: 'High', status: 'Pending', createdAt: daysFromNow(-0.2) },
    { id: 'r-1009', crop: 'Cotton', disease: 'Leaf Curl Virus', confidence: 0.84, pest: 'Whitefly', riskLevel: 'High', status: 'Validated', createdAt: daysFromNow(-2) },
    { id: 'r-1004', crop: 'Chilli', disease: 'Powdery Mildew', confidence: 0.77, pest: null, riskLevel: 'Medium', status: 'Corrected', createdAt: daysFromNow(-5) },
    { id: 'r-0998', crop: 'Onion', disease: 'Healthy', confidence: 0.95, pest: null, riskLevel: 'Low', status: 'Validated', createdAt: daysFromNow(-9) },
  ],
  alerts: [
    { id: 'a-31', type: 'Hotspot', title: 'Early Blight hotspot detected near Nashik', location: 'Nashik, Maharashtra', distanceKm: 2, crop: 'Tomato', riskLevel: 'High', status: 'Active', createdAt: daysFromNow(-0.1) },
    { id: 'a-29', type: 'High risk', title: 'High humidity favours fungal disease this week', location: 'Your farm', distanceKm: 0, crop: 'Chilli', riskLevel: 'Medium', status: 'Active', createdAt: daysFromNow(-1) },
  ],
  followUps: [
    { id: 'f-7', reportId: 'r-1009', crop: 'Cotton', disease: 'Leaf Curl Virus', nextFollowUp: daysFromNow(2), intervention: 'Spray applied', caseStatus: 'Active' },
    { id: 'f-5', reportId: 'r-1004', crop: 'Chilli', disease: 'Powdery Mildew', nextFollowUp: daysFromNow(-1), intervention: 'Completed', caseStatus: 'Resolved' },
  ],
}

export async function getFarmerDashboard() {
  if (USE_MOCK) {
    await mockDelay(700)
    return MOCK_FARMER_DASHBOARD
  }
  try {
    const { data } = await api.get('/dashboard')
    return data
  } catch (err) {
    throw new Error(err.response?.data?.message || 'Could not load your dashboard.')
  }
}


