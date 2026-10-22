import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { env } from './config/env.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'
import { checkOrigin } from './middleware/originCheck.js'
import { storageMode, uploadDir } from './services/imageStorage.service.js'
import routes from './routes/index.js'

const app = express()

app.use(helmet())
// The frontend uses withCredentials (HttpOnly cookie), so the origin must be explicit and credentials allowed.
app.use(cors({ origin: env.clientOrigin, credentials: true }))
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())
if (env.nodeEnv !== 'test') app.use(morgan('dev'))

// Local development fallback only: Cloudinary serves its own images. helmet blocks cross-origin image use by default,
// so this folder explicitly allows the frontend (a different port) to display the photos.
if (storageMode === 'local') {
  app.use('/uploads', (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
    next()
  }, express.static(uploadDir, { index: false, dotfiles: 'deny' }))
}

app.use('/api', checkOrigin, routes)
app.use(notFound)
app.use(errorHandler)

export default app
