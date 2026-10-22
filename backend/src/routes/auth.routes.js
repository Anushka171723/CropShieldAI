import { Router } from 'express'
import { forgotPassword, login, logout, me, register } from '../controllers/auth.controller.js'
import { authenticate } from '../middleware/auth.js'
import { loginLimiter, registerLimiter } from '../middleware/rateLimit.js'

const router = Router()

router.post('/register', registerLimiter, register)
router.post('/login', loginLimiter, login)
router.post('/logout', logout)
router.get('/me', authenticate, me)
router.post('/forgot-password', loginLimiter, forgotPassword)

export default router
