import { registerUser, toPublicUser, verifyCredentials } from '../services/auth.service.js'
import { HttpError } from '../middleware/errorHandler.js'
import { clearAuthCookie, setAuthCookie, signToken } from '../utils/token.js'
import { validateLogin, validateRegister } from '../validators/auth.validators.js'

// Controllers stay thin: read the request, call validators/services, send the response.

export async function register(req, res, next) {
  try {
    const { values, errors } = validateRegister(req.body)
    if (Object.keys(errors).length > 0) throw new HttpError(400, 'Please check the highlighted field.', errors)

    const user = await registerUser(values)
    setAuthCookie(res, signToken(user.id, false), false)
    res.status(201).json({ user: toPublicUser(user) })
  } catch (err) {
    next(err)
  }
}

export async function login(req, res, next) {
  try {
    const { values, errors } = validateLogin(req.body)
    if (Object.keys(errors).length > 0) throw new HttpError(400, 'Enter your email and password.', errors)

    const user = await verifyCredentials(values)
    setAuthCookie(res, signToken(user.id, values.rememberMe), values.rememberMe)
    res.json({ user: toPublicUser(user) })
  } catch (err) {
    next(err)
  }
}

export function logout(req, res) {
  clearAuthCookie(res)
  res.status(204).end()
}

export function me(req, res) {
  res.json({ user: toPublicUser(req.user) }) // req.user was set by the authenticate middleware
}

// The frontend expects 200 whether or not the email exists (so nobody can discover registered emails).
// No email is sent yet: email delivery is not part of the review milestone.
export function forgotPassword(req, res) {
  res.json({ message: 'If an account exists for that email, reset instructions will be sent.' })
}
