import bcrypt from 'bcryptjs'
import { prisma } from '../config/prisma.js'
import { HttpError } from '../middleware/errorHandler.js'

const SALT_ROUNDS = 12
// Used when the email does not exist, so a wrong email takes the same time as a wrong password
// (otherwise an attacker could tell which emails are registered by measuring response time).
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password-1', SALT_ROUNDS)

// The ONLY shape of a user that ever leaves the server. passwordHash is never included.
export const toPublicUser = ({ id, name, email, phone, role }) => ({ id, name, email, phone, role })

export async function registerUser({ name, email, phone, password }) {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) throw new HttpError(409, 'Please check the highlighted field.', { email: 'An account with this email already exists.' })

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
  try {
    return await prisma.user.create({ data: { name, email, phone, passwordHash, role: 'FARMER' } })
  } catch (err) {
    // Two sign-ups with the same email at the same instant: the database's unique rule catches the second one.
    if (err.code === 'P2002') throw new HttpError(409, 'Please check the highlighted field.', { email: 'An account with this email already exists.' })
    throw err
  }
}

export async function verifyCredentials({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } })
  const matches = await bcrypt.compare(password, user ? user.passwordHash : DUMMY_HASH)
  if (!user || !matches) throw new HttpError(401, 'Incorrect email or password.') // same message either way
  return user
}
