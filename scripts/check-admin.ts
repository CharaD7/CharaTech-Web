import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

// Create PostgreSQL connection pool
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
})

// Create Prisma adapter for PostgreSQL
const adapter = new PrismaPg(pool)

// Initialize Prisma Client with the adapter
const prisma = new PrismaClient({ adapter })

async function checkAdmin() {
  try {
    const admin = await prisma.user.findUnique({
      where: {
        email: 'jijakahn6@gmail.com'
      }
    })

    if (admin) {
      if (admin.role !== 'ADMIN') {
        await prisma.user.update({
          where: { id: admin.id },
          data: { role: 'ADMIN' }
        })
      }
    } else {
      await prisma.user.create({
        data: {
          email: 'jijakahn6@gmail.com',
          supabaseUid: 'gKT3k6RkyobOYbLHCU0qOw70xLH2',
          role: 'ADMIN'
        }
      })
    }
  } catch (error) {
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

checkAdmin()
