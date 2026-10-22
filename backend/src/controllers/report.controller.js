import { HttpError } from '../middleware/errorHandler.js'
import * as reportService from '../services/report.service.js'
import { detectImageType } from '../utils/imageType.js'
import { parseJsonFields, validateCreateReport, validateImageFile, validateListQuery, validateUpdateReport } from '../validators/report.validators.js'

const CHECK_FIELDS = 'Please check the highlighted field.'

export async function create(req, res, next) {
  try {
    const parsed = parseJsonFields(req.body)
    const { values, errors } = validateCreateReport(parsed.body)
    const image = validateImageFile(req.file, detectImageType)
    const allErrors = { ...errors, ...parsed.errors, ...(image.error && { image: image.error }) }
    if (Object.keys(allErrors).length > 0) throw new HttpError(400, CHECK_FIELDS, allErrors)

    res.status(201).json({ report: await reportService.createReport(req.user, values, { buffer: req.file.buffer, type: image.type }) })
  } catch (err) {
    next(err)
  }
}

export async function list(req, res, next) {
  try {
    const { values, errors } = validateListQuery(req.query)
    if (Object.keys(errors).length > 0) throw new HttpError(400, CHECK_FIELDS, errors)
    res.json({ reports: await reportService.listReports(req.user, values) })
  } catch (err) {
    next(err)
  }
}

export async function crops(req, res, next) {
  try {
    res.json({ crops: await reportService.listReportCrops(req.user) })
  } catch (err) {
    next(err)
  }
}

export async function getOne(req, res, next) {
  try {
    res.json({ report: await reportService.getReport(req.user, req.params.id) })
  } catch (err) {
    next(err)
  }
}

export async function update(req, res, next) {
  try {
    const { values, errors } = validateUpdateReport(req.body)
    if (Object.keys(errors).length > 0) throw new HttpError(400, CHECK_FIELDS, errors)
    res.json({ report: await reportService.updateReport(req.user, req.params.id, values) })
  } catch (err) {
    next(err)
  }
}

export async function detection(req, res, next) {
  try {
    res.json({ detection: await reportService.getDetection(req.user, req.params.id) })
  } catch (err) {
    next(err)
  }
}

export async function retryPrediction(req, res, next) {
  try {
    res.json({ report: await reportService.retryPrediction(req.user, req.params.id) })
  } catch (err) {
    next(err)
  }
}
