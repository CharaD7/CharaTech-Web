import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const prisma = new PrismaClient()

async function main() {
  const adminEmail = 'jijakahn6@gmail.com'
  const adminSupabaseUid = 'gKT3k6RkyobOYbLHCU0qOw70xLH2'

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { supabaseUid: adminSupabaseUid }
  })

  if (existingAdmin) {
    // Update to ensure they have ADMIN role
    if (existingAdmin.role !== 'ADMIN') {
      await prisma.user.update({
        where: { id: existingAdmin.id },
        data: { role: 'ADMIN' }
      })
    }
  } else {
    // Create admin user
    await prisma.user.create({
      data: {
        supabaseUid: adminSupabaseUid,
        email: adminEmail,
        role: 'ADMIN',
        emailVerified: true,
        fullName: 'System Administrator'
      }
    })
  }
}

main()
  .catch(() => {
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
