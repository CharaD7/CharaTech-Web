export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    const { supabaseUid, email, fullName, phoneNumber, companyName } = body
    
    if (!supabaseUid || !email) {
      throw createError({
        statusCode: 400,
        message: 'Supabase UID and email are required',
      })
    }
    
    const config = useRuntimeConfig()
    const isAdmin = supabaseUid === config.adminSupabaseUid
    
    let user
    try {
      user = await prisma.user.upsert({
        where: { supabaseUid },
        create: {
          supabaseUid,
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
    // Log the full error for debugging
    console.error('Registration error:', error)
    console.error('Registration error stack:', error.stack)
    
    // Re-throw H3 errors as-is
    if (error.statusCode) {
      throw error
    }
    // Wrap unexpected errors
    throw createError({
      statusCode: 500,
      message: error.message || 'An unexpected error occurred during registration',
    })
  }
})
