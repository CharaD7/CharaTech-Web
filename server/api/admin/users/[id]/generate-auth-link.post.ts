export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'User ID required',
    })
  }

  const user = await prisma.user.findUnique({
    where: { id },
  })

  if (!user) {
    throw createError({
      statusCode: 404,
      message: 'User not found',
    })
  }

  const config = useRuntimeConfig()

  try {
    const { createClient } = await import('@supabase/supabase-js')
    
    const supabaseUrl = config.public.supabaseProjectUrl || process.env.SUPABASE_PROJECT_URL
    const supabaseKey = config.public.supabaseServiceKey || process.env.SUPABASE_SERVICE_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      throw createError({
        statusCode: 500,
        message: 'Supabase configuration missing',
      })
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data, error } = await supabase.auth.generateLink({
      email: user.email,
      type: 'signup',
    })

    if (error) {
      console.error('Failed to generate auth link:', error.message)
      throw createError({
        statusCode: 400,
        message: error.message,
      })
    }

    return { 
      success: true, 
      message: 'Auth link generated successfully',
      properties: {
        email: data.properties?.email,
        confirmationUrl: data.properties?.confirmationUrl,
      }
    }
  } catch (error: any) {
    console.error('Generate auth link error:', error.message)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to generate auth link',
    })
  }
})