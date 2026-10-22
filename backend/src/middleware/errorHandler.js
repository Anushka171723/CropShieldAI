import { env } from '../config/env.js'

// Throw this from anywhere to send a clean error to the frontend: throw new HttpError(404, 'Report not found')
// The frontend reads `message` (and optionally `errors: { field: "text" }`), see getErrorMessage() in api.js.
export class HttpError extends Error {
  constructor(status, message, errors) {
    super(message)
    this.status = status
    this.errors = errors
  }
}

export const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` })
}

// Express recognises an error handler by its 4 arguments. Keep all 4 even if `next` is unused.
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  // Malformed JSON in the request body: answer with a clean message instead of the parser's internal text.
  if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'The request body is not valid JSON.' })

  const status = err.status || 500
  if (status >= 500) console.error(err) // real problems are logged, never silently swallowed

  res.status(status).json({
    message: status >= 500 ? 'Something went wrong on the server.' : err.message, // no internals leaked
    ...(err.errors && { errors: err.errors }),
    ...(env.nodeEnv === 'development' && status >= 500 && { debug: err.message }),
  })
}
