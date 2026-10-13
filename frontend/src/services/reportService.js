import api, { USE_MOCK, mockDelay } from './api'

// payload: { crop, variety, growthStage, symptoms: string[], notes, location: {lat, lng}, image: File }
// Resolves to { id } of the new report. Backend: POST /api/reports (multipart/form-data) - field names to confirm with Member 2.
export async function createReport(payload) {
  if (USE_MOCK) {
    await mockDelay(1800)
    return { id: 'r-1013' }
  }

  const form = new FormData()
  form.append('crop', payload.crop)
  form.append('variety', payload.variety)
  form.append('growthStage', payload.growthStage)
  form.append('symptoms', JSON.stringify(payload.symptoms))
  form.append('notes', payload.notes)
  form.append('latitude', payload.location.lat)
  form.append('longitude', payload.location.lng)
  form.append('image', payload.image)

  try {
    const { data } = await api.post('/reports', form, { timeout: 60000 })
    return { id: data.id || data._id }
  } catch (err) {
    throw new Error(err.response?.data?.message || 'Could not submit your report. Please try again.')
  }
}
