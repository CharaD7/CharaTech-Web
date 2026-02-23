import { H3Event } from 'h3'

/**
 * Fallback authentication using Firebase REST API
 * This verifies tokens without needing the Admin SDK
 */
export const verifyTokenWithRestAPI = async (token: string) => {
  const config = useRuntimeConfig()
  
  try {
    // Verify the token using Firebase REST API
    const response = await $fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${config.public.firebaseApiKey}`, {
      method: 'POST',
      body: {
        idToken: token,
      },
    })
    
    if (response && (response as any).users && (response as any).users.length > 0) {
      const user = (response as any).users[0]
      return {
        uid: user.localId,
        email: user.email,
        email_verified: user.emailVerified || false,
      }
    }
    
    throw new Error('Invalid token')
  } catch (error: any) {
    console.error('Token verification error:', error.message)
    throw new Error('Invalid token')
  }
}

export const verifyTokenFallback = async (event: H3Event) => {
  const authHeader = getHeader(event, 'authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  const token = authHeader.split('Bearer ')[1]

  try {
    const decodedToken = await verifyTokenWithRestAPI(token)
    return decodedToken
  } catch (error: any) {
    console.error('Token verification error:', error.message)
    throw createError({
      statusCode: 401,
      message: 'Invalid token',
    })
  }
}

export const requireAuthFallback = async (event: H3Event) => {
  const decodedToken = await verifyTokenFallback(event)
  
  const user = await prisma.user.findUnique({
    where: { firebaseUid: decodedToken.uid },
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

export const requireAdminFallback = async (event: H3Event) => {
  const user = await requireAuthFallback(event)

  if (user.role !== 'ADMIN') {
    throw createError({
      statusCode: 403,
      message: 'Admin access required',
    })
  }

  return user
}
