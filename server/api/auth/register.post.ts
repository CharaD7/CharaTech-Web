export default defineEventHandler(async (event) => {
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

  const user = await prisma.user.upsert({
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

  if (user.role === 'CLIENT') {
    // Temporarily commented out to bypass email rate limit during development
    // await sendEmail(
    //   user.email,
    //   'Welcome to CharaTech!',
    //   `
    //     <h1>Welcome to CharaTech Requirements Platform!</h1>
    //     <p>Hi ${user.fullName || 'there'},</p>
    //     <p>Thank you for registering. You can now submit your software requirements.</p>
    //     <p>Visit your dashboard: ${config.public.appUrl}/dashboard</p>
    //   `
    // )

    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'WELCOME',
        channel: ['IN_APP'], // Removed 'EMAIL' channel
        subject: 'Welcome to CharaTech!',
        message: 'Thank you for registering with CharaTech Requirements Platform.',
        sentAt: new Date(),
      },
    })
  }

  return user
})
