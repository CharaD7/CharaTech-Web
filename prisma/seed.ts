import { PrismaClient } from '@prisma/client'
import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Starting database seeding...')

  const adminEmail = process.env.ADMIN_EMAIL || 'jijakahn6@gmail.com'
  const adminFirebaseUid = process.env.ADMIN_FIREBASE_UID || '2cfQUoHN96dbx0ovHoCgDRIa4113'
  const adminFullName = 'System Administrator'

  try {
    // Check if user exists in database
    let dbUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    })

    if (dbUser) {
      // Update existing user to admin
      dbUser = await prisma.user.update({
        where: { email: adminEmail },
        data: {
          role: 'ADMIN',
          emailVerified: true,
          firebaseUid: adminFirebaseUid,
          fullName: adminFullName,
        },
      })
      console.log('✓ Updated existing user to ADMIN role')
    } else {
      // Create new admin user in database
      dbUser = await prisma.user.create({
        data: {
          firebaseUid: adminFirebaseUid,
          email: adminEmail,
          fullName: adminFullName,
          role: 'ADMIN',
          emailVerified: true,
        },
      })
      console.log('✓ Created admin user in database')
    }

    console.log('\n✓ Seeding completed successfully!')
    console.log('Admin user details:')
    console.log(`  Email: ${adminEmail}`)
    console.log(`  Role: ${dbUser.role}`)
    console.log(`  Firebase UID: ${dbUser.firebaseUid}`)
    console.log('\nNote: The user already exists in Firebase. Use Firebase credentials to login.')
  } catch (error) {
    console.error('Error during seeding:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
