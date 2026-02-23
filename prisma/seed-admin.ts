import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const { Pool } = pg
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })

async function main() {
  const adminEmail = 'jijakahn6@gmail.com'
  const firebaseUid = 'gKT3k6RkyobOYbLHCU0qOw70xLH2' // From your login response

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (existingAdmin) {
    console.log('Admin user already exists:', existingAdmin)
    
    // Update to ensure role is ADMIN
    if (existingAdmin.role !== 'ADMIN') {
      const updated = await prisma.user.update({
        where: { email: adminEmail },
        data: { role: 'ADMIN' }
      })
      console.log('Updated admin role:', updated)
    }
    return
  }

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      firebaseUid,
      email: adminEmail,
      fullName: 'System Administrator',
      role: 'ADMIN',
      emailVerified: true,
    }
  })

  console.log('Admin user created:', admin)
}

main()
  .catch((e) => {
    console.error('Error seeding admin:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
