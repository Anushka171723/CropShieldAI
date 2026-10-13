// Client-side checks are for quick feedback only. The server must validate the same fields again.
export const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())

// Accepts "9876543210", "98765 43210" or "+91 98765-43210" and returns the 10 digits, or null if invalid.
export function normalizeIndianMobile(value) {
  const digits = value.replace(/[\s-]/g, '').replace(/^\+?91/, '')
  return /^[6-9]\d{9}$/.test(digits) ? digits : null
}

export const PASSWORD_HINT = 'At least 8 characters, with a letter and a number.'
export const isStrongPassword = (value) => value.length >= 8 && /[A-Za-z]/.test(value) && /\d/.test(value)

// After a failed submit, move keyboard focus to the first field that has an error.
export function focusFirstInvalid(form) {
  requestAnimationFrame(() => form?.querySelector('[aria-invalid="true"]')?.focus())
}
