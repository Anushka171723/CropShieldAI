import { prisma } from '../config/prisma.js'
import { HttpError } from '../middleware/errorHandler.js'
import { formatReportId, parseReportId } from '../utils/reportId.js'
import { deleteImage, saveImage } from './imageStorage.service.js'
import { analyseReport } from './prediction.service.js'

const title = (value) => value.charAt(0) + value.slice(1).toLowerCase() // "PENDING" -> "Pending"
const withPrediction = { prediction: true }

// The database stores disease and pest separately (the AI contract). The frontend shows ONE headline issue plus an
// optional pest, so we translate here: a disease wins, otherwise a pest, otherwise "healthy".
export function describePrediction(p) {
  if (!p) return { issue: null, issueType: null, pest: null, confidence: null, riskLevel: null }
  const issueType = p.disease ? 'Disease' : p.pest ? 'Pest' : 'Healthy'
  return {
    issue: p.disease || (p.pest ? `${p.pest} infestation` : 'No clear issue found'),
    issueType,
    pest: p.pest,
    confidence: issueType === 'Disease' ? p.diseaseConfidence : issueType === 'Pest' ? p.pestConfidence : (p.diseaseConfidence ?? null),
    riskLevel: title(p.riskLevel),
  }
}

// Turns a database row into the exact shape the frontend pages already use (see frontend data/reports.js).
// predictionSource tells the truth about where the result came from: "mock" (simulated) or "ai-service".
export const toReportResponse = (r) => ({
  id: formatReportId(r.id),
  crop: r.crop,
  variety: r.variety || '',
  growthStage: r.growthStage,
  plot: r.plot,
  symptoms: r.symptoms,
  notes: r.notes || '',
  symptomStart: r.symptomStart ? r.symptomStart.toISOString() : null,
  submittedAt: r.createdAt.toISOString(),
  location: { lat: r.latitude, lng: r.longitude },
  imageUrl: r.imageUrl,
  ...describePrediction(r.prediction),
  predictionStatus: title(r.predictionStatus), // Pending | Completed | Failed
  predictionSource: r.prediction ? (r.prediction.source === 'MOCK' ? 'mock' : 'ai-service') : null,
  reviewStatus: title(r.reviewStatus),
  caseStatus: title(r.caseStatus),
  followUpIds: [], // filled when follow-ups are built (after the review)
})

// Farmers only ever see their own reports. Expert / Officer / Admin can read all of them.
const visibleTo = (user) => (user.role === 'FARMER' ? { userId: user.id } : {})

// `image` is { buffer, type } and has already been validated by the controller.
export async function createReport(user, values, image) {
  const stored = await saveImage(image.buffer, image.type) // if this fails, nothing is saved in the database
  let report
  try {
    report = await prisma.cropReport.create({ data: { ...values, userId: user.id, imageUrl: stored.url, imagePublicId: stored.publicId } })
  } catch (err) {
    await deleteImage(stored.publicId) // no orphan photos if the database save fails
    throw err
  }
  // The report is safely saved. Now analyse it. This never throws, so an AI outage cannot lose the farmer's report.
  return toReportResponse(await analyseReport(report))
}

export async function listReports(user, { search, status, crop, sort }) {
  const where = { ...visibleTo(user) }
  if (status) where.reviewStatus = status
  if (crop) where.crop = crop
  if (search) {
    const idMatch = parseReportId(search)
    where.OR = [{ crop: { contains: search, mode: 'insensitive' } }, ...(idMatch ? [{ id: idMatch }] : [])]
  }
  const rows = await prisma.cropReport.findMany({ where, include: withPrediction, orderBy: { createdAt: sort === 'oldest' ? 'asc' : 'desc' } })
  return rows.map(toReportResponse)
}

export async function listReportCrops(user) {
  const rows = await prisma.cropReport.findMany({ where: visibleTo(user), distinct: ['crop'], select: { crop: true }, orderBy: { crop: 'asc' } })
  return rows.map((r) => r.crop)
}

// A report that exists but belongs to someone else gets the SAME "not found" answer as one that does not exist,
// so changing the id in the URL reveals nothing.
async function findAllowedReport(user, rawId) {
  const id = parseReportId(rawId)
  const report = id ? await prisma.cropReport.findUnique({ where: { id }, include: withPrediction }) : null
  if (!report || (user.role === 'FARMER' && report.userId !== user.id)) throw new HttpError(404, 'Report not found.')
  return report
}

export async function getReport(user, rawId) {
  return toReportResponse(await findAllowedReport(user, rawId))
}

export async function updateReport(user, rawId, values) {
  const report = await findAllowedReport(user, rawId)
  if (report.userId !== user.id) throw new HttpError(403, 'You do not have permission to do that.') // staff may read, but not edit a farmer's report
  const updated = await prisma.cropReport.update({ where: { id: report.id }, data: values, include: withPrediction })
  return toReportResponse(updated)
}

function buildSummary(report, d) {
  if (report.predictionStatus === 'PENDING') return 'The analysis for this report has not run yet.'
  if (report.predictionStatus === 'FAILED') return 'The analysis service was not available, so there is no result yet. Your report is saved. Please try again in a few minutes.'
  if (d.issueType === 'Healthy') return `No disease or pest symptoms were detected on this ${report.crop.toLowerCase()} sample.`
  const extraPest = d.issueType === 'Disease' && d.pest ? ` and possible ${d.pest.toLowerCase()} activity` : ''
  return `The sample shows signs consistent with ${d.issue.toLowerCase()}${extraPest}. An agriculture expert should confirm this before you take action.`
}

// Shape of the frontend's "Detection Result" screen (see getDetection in the frontend mock service), plus honesty fields.
export async function getDetection(user, rawId) {
  const report = await findAllowedReport(user, rawId)
  const d = describePrediction(report.prediction)
  return {
    reportId: formatReportId(report.id),
    crop: report.crop,
    variety: report.variety || '',
    growthStage: report.growthStage,
    imageUrl: report.imageUrl,
    submittedAt: report.createdAt.toISOString(),
    ...d,
    reviewStatus: title(report.reviewStatus),
    summary: buildSummary(report, d),
    predictionStatus: title(report.predictionStatus),
    isMock: report.prediction?.source === 'MOCK', // true = simulated demo result, NOT real AI
    modelVersion: report.prediction?.modelVersion ?? null,
  }
}

// Lets a farmer re-run the analysis when it failed (or never ran). A finished analysis is not silently overwritten.
export async function retryPrediction(user, rawId) {
  const report = await findAllowedReport(user, rawId)
  if (report.userId !== user.id) throw new HttpError(403, 'You do not have permission to do that.')
  if (report.predictionStatus === 'COMPLETED') throw new HttpError(409, 'This report has already been analysed.')
  return toReportResponse(await analyseReport(report))
}
