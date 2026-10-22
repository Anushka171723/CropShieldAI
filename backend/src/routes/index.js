import { Router } from 'express'
import authRoutes from './auth.routes.js'
import healthRoutes from './health.routes.js'
import reportRoutes from './report.routes.js'

const router = Router()

router.use('/health', healthRoutes)
router.use('/auth', authRoutes)
router.use('/reports', reportRoutes)

export default router
