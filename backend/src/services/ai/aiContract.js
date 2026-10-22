import { formatReportId } from '../../utils/reportId.js'

// The contract with the AI service (see docs/AI_CONTRACT.md). It must be agreed with the person building the AI service.

export class AiResponseError extends Error {}

// What we SEND. It contains crop data only: no name, email or phone of the farmer.
export const buildAiRequest = (report) => ({
  reportId: formatReportId(report.id),
  imageUrl: report.imageUrl,
  crop: report.crop,
  variety: report.variety,
  growthStage: report.growthStage,
  symptoms: report.symptoms,
  notes: report.notes,
  location: { lat: report.latitude, lng: report.longitude },
  weather: null, // filled in once the weather integration exists
})

const bad = (message) => new AiResponseError(`Invalid AI response: ${message}`)
const NO_FINDING = new Set(['', 'healthy', 'none', 'no disease', 'no pest', 'n/a', 'null'])

function cleanName(value, field) {
  if (value === null || value === undefined) return null
  if (typeof value !== 'string') throw bad(`${field} must be text or null`)
  const text = value.trim()
  if (text.length > 120) throw bad(`${field} is too long`)
  return NO_FINDING.has(text.toLowerCase()) ? null : text
}

function cleanConfidence(value, field, required) {
  if (value === null || value === undefined) {
    if (required) throw bad(`${field} is required when a finding is reported`)
    return null
  }
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 1) throw bad(`${field} must be a number between 0 and 1`)
  return Math.round(value * 1000) / 1000
}

// We never store what the service sends until it passes these checks.
export function validateAiResponse(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw bad('expected a JSON object')

  const disease = cleanName(data.disease, 'disease')
  const pest = cleanName(data.pest, 'pest')
  const diseaseConfidence = cleanConfidence(data.diseaseConfidence, 'diseaseConfidence', disease !== null)
  const pestConfidence = cleanConfidence(data.pestConfidence, 'pestConfidence', pest !== null)

  const risk = typeof data.riskLevel === 'string' ? data.riskLevel.trim().toUpperCase() : ''
  if (!['LOW', 'MEDIUM', 'HIGH'].includes(risk)) throw bad('riskLevel must be Low, Medium or High')

  const modelVersion = typeof data.modelVersion === 'string' ? data.modelVersion.trim().slice(0, 60) || null : null
  return { disease, diseaseConfidence, pest, pestConfidence, riskLevel: risk, modelVersion }
}
