import { buildAdvisory } from '../../data/advisoryContent'
import { seedAlerts } from '../../data/alerts'
import { runSimulatedDetection } from '../../data/detectionRules'
import { farmerProfile } from '../../data/farmerProfile'
import { seedFollowUps } from '../../data/followUps'
import { seedHotspots } from '../../data/hotspots'
import { seedReports } from '../../data/reports'
import { buildRiskAssessment } from '../../data/riskRules'
import { sampleWeather } from '../../data/weather'
import { distanceKm } from '../../utils/geo'
import { mockDelay } from '../api'
import { loadCollection, saveCollection } from './demoStore'

// Everything here is sample data. Replace these functions with real API calls (same names, same return shape)
// when the backend exists; the pages only talk to services/farmerService.js.
const NEARBY_RADIUS_KM = 25

const byNewest = (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)
const reports = () => loadCollection('reports', seedReports)
const alerts = () => loadCollection('alerts', seedAlerts)
const followUps = () => loadCollection('followUps', seedFollowUps)
const profile = () => loadCollection('profile', farmerProfile)

// Reports created in this demo session get ids after the last seed report so they sort predictably.
let nextSeq = Math.max(0, ...seedReports.map((r) => Number(r.id.split('-')[1]) || 0)) + 1
const newReportId = () => `rpt-${String(1000 + nextSeq++).padStart(4, '0')}`

function withDistance(hotspot, center) {
  return { ...hotspot, distanceKm: distanceKm(center, hotspot) }
}

export async function getWeather() {
  await mockDelay(250)
  return sampleWeather
}

export async function getFarmerProfile() {
  await mockDelay(250)
  return profile()
}

// updates: a partial profile object (e.g. { name, phone, village, crops, language, notifications }).
// Merges into the existing profile and saves it to the local demo store. DEMO ONLY: no backend account
// is touched, and no password or token lives here, only non-sensitive display/preference fields.
export async function updateFarmerProfile(updates) {
  await mockDelay(600)
  const next = { ...profile(), ...updates }
  saveCollection('profile', next)
  return next
}

// One call for the home screen, shaped like a single future "GET /farmer/dashboard" response.
export async function getFarmerDashboard() {
  await mockDelay(600)
  const currentProfile = profile()
  const all = [...reports()].sort(byNewest)
  const nearby = seedHotspots
    .map((h) => withDistance(h, currentProfile.farm))
    .filter((h) => h.distanceKm <= NEARBY_RADIUS_KM)
    .sort((a, b) => a.distanceKm - b.distanceKm)
  const unreadFirst = [...alerts()].sort((a, b) => Number(a.read) - Number(b.read) || new Date(b.createdAt) - new Date(a.createdAt))

  return {
    profile: currentProfile,
    stats: {
      totalReports: all.length,
      pendingReview: all.filter((r) => r.reviewStatus === 'Pending').length,
      highRisk: all.filter((r) => r.riskLevel === 'High' && r.caseStatus === 'Active').length,
      resolved: all.filter((r) => r.caseStatus === 'Resolved').length,
    },
    recentReports: all.slice(0, 5),
    weather: sampleWeather,
    nearbyRisk: {
      radiusKm: NEARBY_RADIUS_KM,
      counts: { High: nearby.filter((h) => h.riskLevel === 'High').length, Medium: nearby.filter((h) => h.riskLevel === 'Medium').length, Low: nearby.filter((h) => h.riskLevel === 'Low').length },
      closest: nearby.slice(0, 3),
    },
    alerts: { unread: unreadFirst.filter((a) => !a.read).length, items: unreadFirst.slice(0, 4) },
    followUps: followUps()
      .filter((f) => f.status === 'Pending')
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 3),
  }
}

// payload: { crop, variety, growthStage, symptoms: string[], notes, symptomStart, location: {lat,lng}, image: File|null }
// Simulates submitting a report: creates a report record with a deterministic SIMULATED detection result
// attached, saves it to the local demo store, and resolves to its id. No image is uploaded anywhere and
// no AI model runs; see data/detectionRules.js.
export async function createReport(payload) {
  await mockDelay(1600)

  const id = newReportId()
  // Object URLs only live for this browser tab/session; that is enough for a frontend-only demo preview.
  const imageUrl = payload.image ? URL.createObjectURL(payload.image) : null
  const detection = runSimulatedDetection({ id, crop: payload.crop, symptoms: payload.symptoms })

  const report = {
    id,
    crop: payload.crop,
    variety: payload.variety || '',
    growthStage: payload.growthStage,
    plot: 'My field',
    symptoms: payload.symptoms,
    notes: payload.notes || '',
    symptomStart: payload.symptomStart || null,
    submittedAt: new Date().toISOString(),
    location: payload.location,
    imageUrl,
    issue: detection.issue,
    issueType: detection.issueType,
    pest: detection.pest,
    confidence: detection.confidence,
    riskLevel: detection.riskLevel,
    reviewStatus: 'Pending',
    caseStatus: 'Active',
    followUpIds: [],
    isDemoSubmission: true,
  }

  saveCollection('reports', [report, ...reports()])
  return { id }
}

// A single report by id, as submitted (or seeded). Resolves to null if it does not exist, so pages can
// show a clear "not found" state instead of throwing.
export async function getReport(id) {
  await mockDelay(300)
  return reports().find((r) => r.id === id) || null
}

// Every crop grown across the farmer's reports, for the "My Reports" crop filter.
export async function getReportCrops() {
  await mockDelay(150)
  return [...new Set(reports().map((r) => r.crop))].sort()
}

// query: { search?: string, status?: 'All'|reviewStatus, crop?: 'All'|string, sort?: 'newest'|'oldest' }
// Search/filter/sort over the farmer's reports, done entirely on the frontend against sample data.
export async function listReports(query = {}) {
  await mockDelay(400)
  const { search = '', status = 'All', crop = 'All', sort = 'newest' } = query
  const term = search.trim().toLowerCase()

  let list = reports().filter((r) => {
    const matchesSearch = !term || r.crop.toLowerCase().includes(term) || r.id.toLowerCase().includes(term) || r.issue.toLowerCase().includes(term)
    const matchesStatus = status === 'All' || r.reviewStatus === status
    const matchesCrop = crop === 'All' || r.crop === crop
    return matchesSearch && matchesStatus && matchesCrop
  })

  list = list.sort((a, b) => (sort === 'oldest' ? new Date(a.submittedAt) - new Date(b.submittedAt) : new Date(b.submittedAt) - new Date(a.submittedAt)))
  return list
}

// Follow-ups linked to one report, oldest first, for the Report Details timeline.
export async function getFollowUpsForReport(reportId) {
  await mockDelay(250)
  return followUps()
    .filter((f) => f.reportId === reportId)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
}

// Simulated AI detection result for one report, shaped for the Detection Result screen. Confidence and
// findings are SAMPLE values from data/detectionRules.js, not the output of a real model.
export async function getDetection(id) {
  await mockDelay(500)
  const report = reports().find((r) => r.id === id)
  if (!report) return null
  return {
    reportId: report.id,
    crop: report.crop,
    variety: report.variety,
    growthStage: report.growthStage,
    imageUrl: report.imageUrl,
    submittedAt: report.submittedAt,
    issue: report.issue,
    issueType: report.issueType,
    pest: report.pest,
    confidence: report.confidence,
    riskLevel: report.riskLevel,
    reviewStatus: report.reviewStatus,
    summary:
      report.issueType === 'Healthy'
        ? `No disease or pest symptoms were detected on this ${report.crop.toLowerCase()} sample.`
        : `The sample shows signs consistent with ${report.issue.split(' (')[0].toLowerCase()}${report.pest ? ` and possible ${report.pest.toLowerCase()} activity` : ''}. An agriculture expert should confirm this before you take action.`,
  }
}

// Weather-based risk assessment for one report, shaped for the Risk Assessment screen. Combines the
// report's SIMULATED detection with SAMPLE weather; see data/riskRules.js. Resolves to null if the
// report does not exist.
export async function getRiskAssessment(id) {
  await mockDelay(500)
  const report = reports().find((r) => r.id === id)
  if (!report) return null
  return {
    reportId: report.id,
    crop: report.crop,
    issue: report.issue,
    reviewStatus: report.reviewStatus,
    ...buildRiskAssessment(report, sampleWeather),
  }
}

// General, cautious advisory content for one report, shaped for the Crop Advisory screen. SAMPLE
// guidance only; see data/advisoryContent.js. Resolves to null if the report does not exist.
export async function getAdvisory(id) {
  await mockDelay(450)
  const report = reports().find((r) => r.id === id)
  if (!report) return null
  return {
    reportId: report.id,
    crop: report.crop,
    issue: report.issue,
    issueType: report.issueType,
    ...buildAdvisory(report),
  }
}

// Every crop and disease/pest name across the illustrative hotspots, for the Nearby Hotspots filters.
export async function getHotspotFilterOptions() {
  await mockDelay(150)
  return {
    crops: [...new Set(seedHotspots.map((h) => h.crop))].sort(),
    types: ['Disease', 'Pest'],
  }
}

// query: { center?: {lat,lng}, crop?: 'All'|string, type?: 'All'|'Disease'|'Pest', withinDays?: number }
// ILLUSTRATIVE hotspot records only, distances computed from `center` (the farm, or the farmer's device
// location if they chose to share it). Resolves to a list sorted nearest first.
export async function getHotspots(query = {}) {
  await mockDelay(500)
  const { center = profile().farm, crop = 'All', type = 'All', withinDays = null } = query
  const cutoff = withinDays ? Date.now() - withinDays * 864e5 : null

  return seedHotspots
    .filter((h) => (crop === 'All' || h.crop === crop) && (type === 'All' || h.type === type) && (!cutoff || new Date(h.lastReportedAt).getTime() >= cutoff))
    .map((h) => withDistance(h, center))
    .sort((a, b) => a.distanceKm - b.distanceKm)
}

const byNewestAlert = (a, b) => new Date(b.createdAt) - new Date(a.createdAt)

// query: { type?: 'All'|alert type, readState?: 'All'|'Unread'|'Read' }
// SAMPLE alerts, newest first. Read/unread state is held in the local demo store so toggling it persists
// for this browser only; no real push notification is involved.
export async function listAlerts(query = {}) {
  await mockDelay(350)
  const { type = 'All', readState = 'All' } = query
  return [...alerts()]
    .filter((a) => (type === 'All' || a.type === type) && (readState === 'All' || (readState === 'Unread' ? !a.read : a.read)))
    .sort(byNewestAlert)
}

export async function getAlertTypes() {
  await mockDelay(100)
  return [...new Set(seedAlerts.map((a) => a.type))]
}

// Flips one alert's read state in the local demo store. DEMO ONLY: no server or push notification exists.
export async function setAlertRead(id, read) {
  await mockDelay(150)
  saveCollection('alerts', alerts().map((a) => (a.id === id ? { ...a, read } : a)))
  return { id, read }
}

// Marks every alert read in one go, for a "mark all as read" action. DEMO ONLY.
export async function markAllAlertsRead() {
  await mockDelay(200)
  saveCollection('alerts', alerts().map((a) => ({ ...a, read: true })))
}

const byDueDate = (a, b) => new Date(a.dueDate) - new Date(b.dueDate)

// query: { status?: 'All'|'Pending'|'Completed' }
// Every follow-up, joined with its report's crop/issue so the list does not need a second lookup per row.
export async function listFollowUps(query = {}) {
  await mockDelay(400)
  const { status = 'All' } = query
  const reportById = new Map(reports().map((r) => [r.id, r]))
  return followUps()
    .filter((f) => status === 'All' || f.status === status)
    .map((f) => ({ ...f, report: reportById.get(f.reportId) || null }))
    .sort(byDueDate)
}

// One follow-up with its related report and advisory status, for the Follow-up Details screen.
// Resolves to null if it does not exist.
export async function getFollowUp(id) {
  await mockDelay(300)
  const followUp = followUps().find((f) => f.id === id)
  if (!followUp) return null
  const report = reports().find((r) => r.id === followUp.reportId) || null
  return { ...followUp, report }
}

// update: { outcome: 'Improved'|'Unchanged'|'Worsened', note: string, image: File|null }
// Appends a new entry to the follow-up's timeline and updates its summary fields. DEMO ONLY: saved to
// the local demo store, not a real server; a fresh photo is only an object URL for this browser tab.
export async function submitFollowUpUpdate(id, update) {
  await mockDelay(1200)
  const imageUrl = update.image ? URL.createObjectURL(update.image) : null
  const entry = { at: new Date().toISOString(), outcome: update.outcome, note: update.note.trim(), imageUrl }

  saveCollection(
    'followUps',
    followUps().map((f) =>
      f.id === id
        ? {
            ...f,
            status: update.outcome === 'Improved' ? 'Completed' : 'Pending',
            lastUpdate: entry.note || `Marked as ${entry.outcome.toLowerCase()}.`,
            updates: [...f.updates, entry],
          }
        : f,
    ),
  )

  return getFollowUp(id)
}
