import { PrismaClient, UserRole } from '@prisma/client'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const prisma = new PrismaClient()

async function main() {
  const adminEmail = 'jijakahn6@gmail.com'
  const adminSupabaseUid = 'gKT3k6RkyobOYbLHCU0qOw70xLH2'

  // Check if admin already exists by supabaseUid
  let dbUser = await prisma.user.findUnique({
    where: { supabaseUid: adminSupabaseUid }
  })

  // If not found by supabaseUid, try by email
  if (!dbUser) {
    dbUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    })
  }

  if (dbUser) {
    // Update to ensure they have ADMIN role
    if (dbUser.role !== UserRole.ADMIN) {
      await prisma.user.update({
        where: { id: dbUser.id },
        data: { role: UserRole.ADMIN }
      })
    }
  } else {
    // Create admin user
    dbUser = await prisma.user.create({
      data: {
        supabaseUid: adminSupabaseUid,
        email: adminEmail,
        role: UserRole.ADMIN,
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
