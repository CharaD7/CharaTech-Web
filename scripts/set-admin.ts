import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
})

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function setAdmin() {
  try {
    const adminEmail = 'jijakahn6@gmail.com'
    
    const user = await prisma.user.findUnique({
      where: { email: adminEmail }
    })
    
    if (!user) {
      return
    }
    
    await prisma.user.update({
      where: { email: adminEmail },
      data: { role: 'ADMIN' }
    })
  } catch (error) {
    // Error handling
  } finally {
    await prisma.$disconnect()
    pool.end()
  }
}

setAdmin()
