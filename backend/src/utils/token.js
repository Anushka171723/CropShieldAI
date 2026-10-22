import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export const COOKIE_NAME = 'cropshield_token'
const REMEMBER_MS = 7 * 24 * 60 * 60 * 1000

// The token only carries the user id. Role and name are always read fresh from the database,
// so a changed role or a deleted account takes effect immediately.
export const signToken = (userId, rememberMe) =>
  jwt.sign({ sub: userId }, env.jwtSecret, { expiresIn: rememberMe ? '7d' : '12h' })

export const verifyToken = (token) => jwt.verify(token, env.jwtSecret) // throws if invalid or expired

const baseCookie = {
  httpOnly: true, // JavaScript in the browser can never read this cookie
  secure: env.nodeEnv === 'production', // HTTPS only in production
  sameSite: 'lax',
  path: '/',
}

// "Remember me" = persistent cookie (7 days). Otherwise a session cookie that disappears when the browser closes.
export const setAuthCookie = (res, token, rememberMe) =>
  res.cookie(COOKIE_NAME, token, { ...baseCookie, ...(rememberMe && { maxAge: REMEMBER_MS }) })

export const clearAuthCookie = (res) => res.clearCookie(COOKIE_NAME, baseCookie)
