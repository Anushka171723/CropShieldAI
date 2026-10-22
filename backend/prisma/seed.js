import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

// Creates one demo account per role so you can log in as Expert/Officer/Admin (public registration only makes farmers).
// Safe to run many times: existing accounts are left untouched. DEVELOPMENT ONLY.
if (process.env.NODE_ENV === 'production') {
  console.error('Refusing to seed demo accounts in production.')
  process.exit(1)
}
const password = process.env.SEED_DEMO_PASSWORD
if (!password || password.length < 8) {
  console.error('Set SEED_DEMO_PASSWORD in .env first (at least 8 characters, with a letter and a number).')
  process.exit(1)
}

const prisma = new PrismaClient()

const accounts = [
  { name: 'Ramesh Patil', email: 'farmer@demo.test', phone: '9876543210', role: 'FARMER' },
  { name: 'Dr. Sunita Deshmukh', email: 'expert@demo.test', phone: '9876500001', role: 'EXPERT' },
  { name: 'Anil Kulkarni', email: 'officer@demo.test', phone: '9876500002', role: 'OFFICER' },
  { name: 'System Admin', email: 'admin@demo.test', phone: '9876500003', role: 'ADMIN' },
]

const passwordHash = await bcrypt.hash(password, 12)
for (const account of accounts) {
  const existing = await prisma.user.findUnique({ where: { email: account.email } })
  if (existing) {
    console.log(`skipped (already exists): ${account.email}`)
    continue
  }
  await prisma.user.create({ data: { ...account, passwordHash } })
  console.log(`created ${account.role}: ${account.email}`)
}
await prisma.$disconnect()
