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
    
    // First, list all users
    const allUsers = await prisma.user.findMany({
      select: { id: true, email: true, fullName: true, role: true }
    })
    
    console.log('All users in database:', allUsers)
    
    const user = await prisma.user.findUnique({
      where: { email: adminEmail }
    })
    
    if (!user) {
      console.log(`\nUser with email ${adminEmail} not found. They need to register first.`)
      return
    }
    
    const updated = await prisma.user.update({
      where: { email: adminEmail },
      data: { role: 'ADMIN' }
    })
    
    console.log('\n✅ User updated to ADMIN:', updated.email, '-', updated.role)
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
    pool.end()
  }
}

setAdmin()
