import 'dotenv/config'

// Read every environment variable in ONE place, so the rest of the code never touches process.env directly.
const required = ['DATABASE_URL', 'JWT_SECRET']
const missing = required.filter((key) => !process.env[key])
if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(', ')}. Copy .env.example to .env and fill them in.`)
  process.exit(1)
}

if (process.env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET is too short. Use at least 32 random characters (see .env.example for a command that generates one).')
  process.exit(1)
}

const port = Number(process.env.PORT) || 5000
const nodeEnv = process.env.NODE_ENV || 'development'

const cloudinary = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
}
cloudinary.enabled = Boolean(cloudinary.cloudName && cloudinary.apiKey && cloudinary.apiSecret)

if (nodeEnv === 'production' && !cloudinary.enabled) {
  console.error('Cloudinary credentials are required in production. The local-disk image fallback is for development only.')
  process.exit(1)
}

// AI prediction: "service" calls the separate FastAPI service; "mock" uses simulated results (clearly labelled).
// If AI_MODE is not set, the mode is "service" when AI_SERVICE_URL is set, otherwise "mock".
const aiUrl = (process.env.AI_SERVICE_URL || '').replace(/\/$/, '')
const aiMode = (process.env.AI_MODE || (aiUrl ? 'service' : 'mock')).toLowerCase()
if (!['mock', 'service'].includes(aiMode)) {
  console.error('AI_MODE must be "mock" or "service".')
  process.exit(1)
}
if (aiMode === 'service' && !aiUrl) {
  console.error('AI_MODE=service needs AI_SERVICE_URL (for example http://localhost:8000).')
  process.exit(1)
}

export const env = {
  port,
  nodeEnv,
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  publicUrl: (process.env.PUBLIC_URL || `http://localhost:${port}`).replace(/\/$/, ''),
  cloudinary,
  ai: { mode: aiMode, url: aiUrl, apiKey: process.env.AI_SERVICE_API_KEY || '', timeoutMs: Number(process.env.AI_TIMEOUT_MS) || 20000 },
}
