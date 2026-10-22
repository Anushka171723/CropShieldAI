import { Router } from 'express'
import { prisma } from '../config/prisma.js'

const router = Router()

// GET /api/health -> confirms the server is up AND the database answers.
router.get('/', async (req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: 'ok', database: 'connected', time: new Date().toISOString() })
  } catch (err) {
    next(err)
  }
})

export default router
