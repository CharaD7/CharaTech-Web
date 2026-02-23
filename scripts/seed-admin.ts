import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function main() {
  const adminEmail = 'jijakahn6@gmail.com'
  const adminFirebaseUid = 'gKT3k6RkyobOYbLHCU0qOw70xLH2'

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { firebaseUid: adminFirebaseUid }
  })

  if (existingAdmin) {
    console.log('Admin user already exists:', existingAdmin)
    
    // Update to ensure they have ADMIN role
    if (existingAdmin.role !== 'ADMIN') {
      const updated = await prisma.user.update({
        where: { id: existingAdmin.id },
        data: { role: 'ADMIN' }
      })
      console.log('Updated user to ADMIN role:', updated)
    }
  } else {
    // Create admin user
    const admin = await prisma.user.create({
      data: {
        firebaseUid: adminFirebaseUid,
        email: adminEmail,
        role: 'ADMIN',
        emailVerified: true,
        fullName: 'System Administrator'
      }
    })
    console.log('Created admin user:', admin)
  }
}

main()
  .catch((e) => {
    console.error('Error seeding admin:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
