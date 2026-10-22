import rateLimit from 'express-rate-limit'

const tooMany = { message: 'Too many attempts. Please wait a few minutes and try again.' } // frontend shows its own text on 429

// Slows down password guessing.
export const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false, message: tooMany })

// Slows down mass fake sign-ups.
export const registerLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false, message: tooMany })
