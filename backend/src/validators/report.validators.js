import { CROPS, GROWTH_STAGES, SYMPTOMS } from '../constants/cropOptions.js'

const text = (value) => (typeof value === 'string' ? value.trim() : '')
const isNumber = (value) => typeof value === 'number' && Number.isFinite(value)

const STATUS_FILTER = { Pending: 'PENDING', Validated: 'VALIDATED', Corrected: 'CORRECTED' }

// Mirrors the checks in frontend NewReport.jsx (and adds the ones a browser can skip). Image is validated in Phase D.
export function validateCreateReport(body = {}) {
  const errors = {}

  const crop = text(body.crop)
  if (!CROPS.includes(crop)) errors.crop = 'Select your crop.'

  const growthStage = text(body.growthStage)
  if (!GROWTH_STAGES.includes(growthStage)) errors.growthStage = 'Select the growth stage.'

  const variety = text(body.variety)
  if (variety.length > 80) errors.variety = 'Variety is too long.'

  const notes = text(body.notes)
  if (notes.length > 1000) errors.notes = 'Notes must be 1000 characters or fewer.'

  let symptoms = []
  if (body.symptoms !== undefined && !Array.isArray(body.symptoms)) {
    errors.symptoms = 'Symptoms must be a list.'
  } else {
    symptoms = [...new Set(body.symptoms ?? [])]
    if (symptoms.some((s) => !SYMPTOMS.includes(s))) errors.symptoms = 'One or more symptoms are not valid.'
    else if (symptoms.length === 0 && !notes) errors.symptoms = 'Select at least one symptom or describe what you see.'
  }

  let symptomStart = null
  const rawStart = text(body.symptomStart)
  if (rawStart) {
    const date = /^\d{4}-\d{2}-\d{2}/.test(rawStart) ? new Date(`${rawStart.slice(0, 10)}T00:00:00.000Z`) : null
    if (!date || Number.isNaN(date.getTime()) || date.getTime() > Date.now() + 24 * 60 * 60 * 1000) errors.symptomStart = 'Enter a valid date that is not in the future.'
    else symptomStart = date
  }

  const lat = body.location?.lat
  const lng = body.location?.lng
  if (!isNumber(lat) || !isNumber(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) errors.location = 'Share or pick the location of your field.'

  return { values: { crop, variety: variety || null, growthStage, symptoms, notes: notes || null, symptomStart, latitude: lat, longitude: lng }, errors }
}

// Only fields the current workflow needs: the farmer's own notes. (Review status will change through expert validation later.)
export function validateUpdateReport(body = {}) {
  const errors = {}
  const keys = Object.keys(body)
  if (keys.length === 0) errors.notes = 'Nothing to update.'
  else if (keys.some((k) => k !== 'notes')) errors.notes = 'Only notes can be updated.'
  else if (typeof body.notes !== 'string' || body.notes.trim().length > 1000) errors.notes = 'Notes must be text of 1000 characters or fewer.'
  return { values: { notes: text(body.notes) || null }, errors }
}

// Query string for the report list: ?search=&status=&crop=&sort=
export function validateListQuery(query = {}) {
  const errors = {}
  const search = text(query.search).slice(0, 80)
  const status = text(query.status) || 'All'
  const crop = text(query.crop) || 'All'
  const sort = text(query.sort) || 'newest'

  if (status !== 'All' && !STATUS_FILTER[status]) errors.status = 'Unknown status.'
  if (sort !== 'newest' && sort !== 'oldest') errors.sort = 'Sort must be newest or oldest.'

  return { values: { search, status: status === 'All' ? null : STATUS_FILTER[status], crop: crop === 'All' ? null : crop, sort }, errors }
}

// A multipart form can only send text, so the frontend sends `symptoms` and `location` as JSON strings. Unpack them first.
export function parseJsonFields(body = {}) {
  const parsed = { ...body }
  const errors = {}
  for (const field of ['symptoms', 'location']) {
    if (typeof parsed[field] !== 'string') continue
    try {
      parsed[field] = JSON.parse(parsed[field])
    } catch {
      errors[field] = field === 'location' ? 'Share or pick the location of your field.' : 'Symptoms must be a list.'
    }
  }
  return { body: parsed, errors }
}

// `file` is what multer gives us (or undefined). We check the real bytes, not the type the browser claims.
export function validateImageFile(file, detectImageType) {
  if (!file) return { error: 'Add a clear photo of the affected crop.' }
  const type = detectImageType(file.buffer)
  if (!type) return { error: 'Please upload a JPG, PNG or WebP image.' }
  return { type }
}
