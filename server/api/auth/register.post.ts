export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    const { firebaseUid, email, fullName, phoneNumber, companyName } = body

    if (!firebaseUid || !email) {
      throw createError({
        statusCode: 400,
        message: 'Firebase UID and email are required',
      })
    }

    const config = useRuntimeConfig()
    const isAdmin = firebaseUid === config.adminFirebaseUid

    let user
    try {
      user = await prisma.user.upsert({
        where: { firebaseUid },
        create: {
          firebaseUid,
          email,
          fullName,
          phoneNumber,
          companyName,
          role: isAdmin ? 'ADMIN' : 'CLIENT',
        },
        update: {
          email,
        },
      })
    } catch (dbError: any) {
      console.error('Database error during user upsert:', dbError)
      throw createError({
        statusCode: 500,
        message: 'Failed to create user in database. Please try again.',
      })
    }

    if (user.role === 'CLIENT') {
      // Create welcome notification (non-blocking - don't fail registration if this fails)
      try {
        await prisma.notification.create({
          data: {
            userId: user.id,
            type: 'WELCOME',
            channel: ['IN_APP'],
            subject: 'Welcome to CharaTech!',
            message: 'Thank you for registering with CharaTech Requirements Platform.',
            sentAt: new Date(),
          },
        })
      } catch (notifError) {
        // Log but don't fail - notification is non-critical
        console.error('Failed to create welcome notification:', notifError)
      }
    }

    return user
  } catch (error: any) {
    // Re-throw H3 errors as-is
    if (error.statusCode) {
      throw error
    }
    // Wrap unexpected errors
    console.error('Registration error:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'An unexpected error occurred during registration',
    })
  }
})
