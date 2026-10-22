import { env } from '../config/env.js'
import { prisma } from '../config/prisma.js'
import { formatReportId } from '../utils/reportId.js'
import { buildAiRequest, validateAiResponse } from './ai/aiContract.js'
import { predictViaService } from './ai/httpPredictor.js'
import { predictMock } from './ai/mockPredictor.js'

// Runs the AI analysis for a saved report and stores the result. It NEVER throws: if the AI service is down, slow or
// answers with garbage, the farmer's report is still saved and its predictionStatus becomes FAILED (retry is possible).
// Returns the report with its prediction attached.
export async function analyseReport(report) {
  const source = env.ai.mode === 'service' ? 'AI_SERVICE' : 'MOCK'
  try {
    const request = buildAiRequest(report)
    const raw = source === 'AI_SERVICE' ? await predictViaService(request) : predictMock(request)
    const result = validateAiResponse(raw)

    await prisma.$transaction([
      prisma.prediction.upsert({ where: { reportId: report.id }, create: { reportId: report.id, source, ...result }, update: { source, ...result } }),
      prisma.cropReport.update({ where: { id: report.id }, data: { predictionStatus: 'COMPLETED' } }),
    ])
  } catch (err) {
    console.error(`Prediction failed for ${formatReportId(report.id)} (${source}): ${err.message}`)
    await prisma.cropReport.update({ where: { id: report.id }, data: { predictionStatus: 'FAILED' } }).catch((e) => console.error('Could not record failed status:', e.message))
  }
  return prisma.cropReport.findUnique({ where: { id: report.id }, include: { prediction: true } })
}
