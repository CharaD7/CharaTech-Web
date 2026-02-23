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

async function main() {
  const adminEmail = 'jijakahn6@gmail.com'
  
  try {
    // Update user to admin role
    const user = await prisma.user.update({
      where: {
        email: adminEmail
      },
      data: {
        role: 'ADMIN'
      }
    })
    
    console.log('✅ User updated to admin:', user.email, '- Role:', user.role)
  } catch (error) {
    console.error('❌ Error updating user:', error)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

main()
