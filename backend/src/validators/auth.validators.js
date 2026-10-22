// The frontend checks these too, but the browser can be bypassed, so the server MUST check again.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const text = (value) => (typeof value === 'string' ? value : '')

// Accepts "9876543210", "98765 43210" or "+91 98765-43210" and returns the 10 digits, or null if invalid.
const normalizeIndianMobile = (value) => {
  const digits = text(value).replace(/[\s-]/g, '').replace(/^\+?91/, '')
  return /^[6-9]\d{9}$/.test(digits) ? digits : null
}

const isStrongPassword = (value) => value.length >= 8 && value.length <= 72 && /[A-Za-z]/.test(value) && /\d/.test(value) // bcrypt only reads 72 bytes

export function validateRegister(body = {}) {
  const errors = {}
  const name = text(body.name).trim()
  const email = text(body.email).trim().toLowerCase()
  const phone = normalizeIndianMobile(body.phone)
  const password = text(body.password)

  if (name.length < 2 || name.length > 80) errors.name = 'Enter your full name.'
  if (!EMAIL_RE.test(email) || email.length > 254) errors.email = 'Enter a valid email address.'
  if (!phone) errors.phone = 'Enter a valid 10-digit mobile number.'
  if (!isStrongPassword(password)) errors.password = 'Use 8 to 72 characters, with at least one letter and one number.'

  // NOTE: a "role" sent by the client is deliberately ignored. Public sign-up always creates a FARMER.
  return { values: { name, email, phone, password }, errors }
}

export function validateLogin(body = {}) {
  const email = text(body.email).trim().toLowerCase()
  const password = text(body.password)
  const errors = {}
  if (!email) errors.email = 'Enter your email.'
  if (!password) errors.password = 'Enter your password.'
  return { values: { email, password, rememberMe: body.rememberMe === true }, errors }
}
