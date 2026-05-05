import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
})

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function updateAdmin() {
  try {
    const user = await prisma.user.update({
      where: { email: 'jijakahn6@gmail.com' },
      data: { role: 'ADMIN' }
    })
  } catch (error) {
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    pool.end()
  }
}

updateAdmin()
