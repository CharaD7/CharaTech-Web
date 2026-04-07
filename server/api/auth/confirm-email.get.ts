export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const token = query.token as string
  const email = query.email as string

  if (!token || !email) {
    throw createError({
      statusCode: 400,
      message: 'Token and email are required',
    })
  }

  try {
    const { createClient } = await import('@supabase/supabase-js')
    const config = useRuntimeConfig()

    const supabase = createClient(
      config.public.supabaseProjectUrl as string,
      config.public.supabaseAnonKey as string
    )

    const { data, error } = await supabase.auth.verifyOtp({
      type: 'email',
      token,
      email,
    })

    if (error) {
      throw createError({
        statusCode: 400,
        message: error.message,
      })
    }

    if (!data.user) {
      throw createError({
        statusCode: 400,
        message: 'Invalid confirmation token',
      })
    }

    const user = await prisma.user.findUnique({
      where: { supabaseUid: data.user.id },
    })

    if (user && !user.emailVerified) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      })
    }

    return {
      success: true,
      emailVerified: true,
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Email verification error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to verify email',
    })
  }
})
