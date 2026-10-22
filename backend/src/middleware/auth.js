import { prisma } from '../config/prisma.js'
import { COOKIE_NAME, verifyToken } from '../utils/token.js'
import { HttpError } from './errorHandler.js'

// Put this on any route that needs a logged-in user. It fills in req.user.
export async function authenticate(req, res, next) {
  try {
    const token = req.cookies?.[COOKIE_NAME]
    if (!token) throw new HttpError(401, 'Please sign in.')

    let payload
    try {
      payload = verifyToken(token)
    } catch {
      throw new HttpError(401, 'Your session has ended. Please sign in again.')
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } })
    if (!user) throw new HttpError(401, 'Your session has ended. Please sign in again.')

    req.user = user
    next()
  } catch (err) {
    next(err)
  }
}

// Use AFTER authenticate: router.get('/x', authenticate, authorize('EXPERT', 'ADMIN'), handler)
export const authorize =
  (...roles) =>
  (req, res, next) =>
    roles.includes(req.user?.role) ? next() : next(new HttpError(403, 'You do not have permission to do that.'))
