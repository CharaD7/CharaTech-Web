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
      console.log('Admin user found:')
      console.log(JSON.stringify(admin, null, 2))
      
      if (admin.role !== 'ADMIN') {
        console.log('\nUpdating role to ADMIN...')
        const updated = await prisma.user.update({
          where: { id: admin.id },
          data: { role: 'ADMIN' }
        })
        console.log('Updated:', JSON.stringify(updated, null, 2))
      }
    } else {
      console.log('Admin user not found')
      console.log('\nCreating admin user...')
      
      const newAdmin = await prisma.user.create({
        data: {
          email: 'jijakahn6@gmail.com',
          firebaseUid: 'gKT3k6RkyobOYbLHCU0qOw70xLH2',
          role: 'ADMIN'
        }
      })
      
      console.log('Created:', JSON.stringify(newAdmin, null, 2))
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAdmin()
