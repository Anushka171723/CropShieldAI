import app from './app.js'
import { env } from './config/env.js'
import { prisma } from './config/prisma.js'
import { storageMode } from './services/imageStorage.service.js'

const server = app.listen(env.port, () => {
  console.log(`CropShield API running on http://localhost:${env.port}/api  (health: /api/health)`)
  console.log(env.ai.mode === 'service' ? `AI prediction: real AI service at ${env.ai.url}` : 'AI prediction: MOCK MODE (simulated results from the ticked symptoms, not real AI). Set AI_SERVICE_URL to use the real service.')
  console.log(storageMode === 'cloudinary' ? 'Image storage: Cloudinary' : 'Image storage: LOCAL DISK (development fallback, folder backend/uploads). Add Cloudinary keys to .env to use Cloudinary.')
})

// Close the database connection cleanly when the server stops (Ctrl+C).
const shutdown = async () => {
  server.close()
  await prisma.$disconnect()
  process.exit(0)
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
