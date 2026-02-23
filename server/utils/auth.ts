import { H3Event } from 'h3'
import { getAuth } from 'firebase-admin/auth'
import { initializeApp, cert, getApps } from 'firebase-admin/app'

let adminInitialized = false

try {
  if (!getApps().length) {
    const config = useRuntimeConfig()
    
    const credentials = config.dialogflowCredentials 
      ? JSON.parse(config.dialogflowCredentials as string)
      : undefined

    if (credentials) {
      initializeApp({
        credential: cert(credentials),
        projectId: config.public.firebaseProjectId,
      })
      adminInitialized = true
      console.log('Firebase Admin SDK initialized')
    }
  } else {
    adminInitialized = true
  }
} catch (error) {
  console.warn('Firebase Admin SDK initialization failed, will use REST API fallback:', error)
  adminInitialized = false
}

/**
 * Verify token using Firebase REST API (fallback method)
 */
async function verifyTokenWithRestAPI(token: string) {
  const config = useRuntimeConfig()
  
  try {
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
    console.error('REST API token verification error:', error.message)
    throw new Error('Invalid token')
  }
}

export const verifyToken = async (event: H3Event) => {
  const authHeader = getHeader(event, 'authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  const token = authHeader.split('Bearer ')[1]

  // Try Admin SDK first, fallback to REST API
  try {
    if (adminInitialized) {
      try {
        const decodedToken = await getAuth().verifyIdToken(token, true)
        return decodedToken
      } catch (adminError: any) {
        console.warn('Admin SDK verification failed, trying REST API:', adminError.message)
        return await verifyTokenWithRestAPI(token)
      }
    } else {
      return await verifyTokenWithRestAPI(token)
    }
  } catch (error: any) {
    console.error('Token verification error:', error.message)
    throw createError({
      statusCode: 401,
      message: 'Invalid token',
    })
  }
}

export const requireAuth = async (event: H3Event) => {
  const decodedToken = await verifyToken(event)
  
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
