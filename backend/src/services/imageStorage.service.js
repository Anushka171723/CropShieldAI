import { randomUUID } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { v2 as cloudinary } from 'cloudinary'
import { env } from '../config/env.js'
import { HttpError } from '../middleware/errorHandler.js'

// Crop photos are NEVER stored inside PostgreSQL. The database keeps only the image URL and an id.
// Cloudinary is used when its keys are in .env. Otherwise files go to backend/uploads/ (development only).
export const storageMode = env.cloudinary.enabled ? 'cloudinary' : 'local'
export const uploadDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../uploads')

if (env.cloudinary.enabled) {
  cloudinary.config({ cloud_name: env.cloudinary.cloudName, api_key: env.cloudinary.apiKey, api_secret: env.cloudinary.apiSecret, secure: true })
}

const uploadToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder: 'cropshield/reports', resource_type: 'image' }, (err, result) => (err ? reject(err) : resolve(result)))
    stream.end(buffer)
  })

async function saveLocally(buffer, type) {
  await fs.mkdir(uploadDir, { recursive: true })
  const filename = `${randomUUID()}.${type.ext}` // our own name and extension: the user's file name is never used
  await fs.writeFile(path.join(uploadDir, filename), buffer)
  return { url: `${env.publicUrl}/uploads/${filename}`, publicId: `local:${filename}` }
}

// Returns { url, publicId }. Throws a clean 502 if the upload fails; the real cause is logged.
export async function saveImage(buffer, type) {
  try {
    if (storageMode === 'cloudinary') {
      const result = await uploadToCloudinary(buffer)
      return { url: result.secure_url, publicId: result.public_id }
    }
    return await saveLocally(buffer, type)
  } catch (err) {
    console.error(`Image upload failed (${storageMode}):`, err)
    throw new HttpError(502, 'We could not upload your photo. Please try again.')
  }
}

// Best-effort cleanup, used when the report could not be saved after the photo was already uploaded.
export async function deleteImage(publicId) {
  try {
    if (publicId.startsWith('local:')) await fs.unlink(path.join(uploadDir, path.basename(publicId.slice(6))))
    else await cloudinary.uploader.destroy(publicId)
  } catch (err) {
    console.error('Could not clean up image', publicId, err.message)
  }
}
