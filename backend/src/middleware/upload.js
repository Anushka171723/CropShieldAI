import multer from 'multer'
import { HttpError } from './errorHandler.js'

// Keeps the file in memory just long enough to check it and send it to storage. 5 MB, one file: same as the frontend.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 20, fieldSize: 50 * 1024 },
})

const CHECK = 'Please check the highlighted field.'

// Reads the optional "image" file from a multipart form and turns multer's errors into our standard JSON errors.
export function parseReportUpload(req, res, next) {
  upload.single('image')(req, res, (err) => {
    if (!err) return next()
    if (err.code === 'LIMIT_FILE_SIZE') return next(new HttpError(400, CHECK, { image: 'Image is too large. Maximum size is 5 MB.' }))
    if (err instanceof multer.MulterError) return next(new HttpError(400, CHECK, { image: 'We could not read the uploaded image.' }))
    next(err)
  })
}
