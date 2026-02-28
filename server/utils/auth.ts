import { H3Event } from 'h3'
import { jwtVerify } from 'jose'

export const verifyToken = async (event: H3Event) => {
  const authHeader = getHeader(event, 'authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  const token = authHeader.split('Bearer ')[1]
  const config = useRuntimeConfig()

  if (!config.supabaseServiceRoleKey) {
    throw createError({
      statusCode: 500,
      message: 'Supabase service role key is not configured.',
    })
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(config.supabaseServiceRoleKey)
    )
    
    // Supabase JWTs use 'sub' for user ID and 'email' for email
    return {
      uid: payload.sub as string,
      email: payload.email as string,
      email_verified: payload.email_verified as boolean || false,
    }
  } catch (error: any) {
    console.error('JWT verification error:', error.message)
    throw createError({
      statusCode: 401,
      message: 'Invalid token',
    })
  }
}

export const requireAuth = async (event: H3Event) => {
  const decodedToken = await verifyToken(event)
  
  const user = await prisma.user.findUnique({
    where: { supabaseUid: decodedToken.uid },
  })

  if (!user) {
    throw createError({
      statusCode: 404,
      message: 'User not found',
    })
  }

  event.context.user = user
  return user
}

export const requireAdmin = async (event: H3Event) => {
  const user = await requireAuth(event)

  if (user.role !== 'ADMIN') {
    throw createError({
      statusCode: 403,
      message: 'Admin access required',
    })
  }

  return user
}
