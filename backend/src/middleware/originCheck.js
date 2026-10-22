import { env } from '../config/env.js'
import { HttpError } from './errorHandler.js'

// CSRF protection (on top of SameSite=Lax cookies): a browser always sends an Origin header on cross-site POSTs,
// so any state-changing request from a website other than our frontend is rejected.
// Postman/curl send no Origin header, so they still work for testing.
export function checkOrigin(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next()
  const origin = req.get('origin')
  if (origin && origin !== env.clientOrigin) return next(new HttpError(403, 'Request origin not allowed.'))
  next()
}
