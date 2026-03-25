import { H3Event } from 'h3'
import prisma from './prisma'

export const verifyToken = async (event: H3Event) => {
  const authHeader = getHeader(event, 'authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  const token = authHeader.split('Bearer ')[1] as string
  const config = useRuntimeConfig()

  // Check if it's a Firebase token (starts with typical Firebase token format)
  const isFirebaseToken = token.length < 500 // Firebase tokens are typically shorter

  try {
    if (isFirebaseToken) {
      // Verify Firebase token
      const firebaseApiKey = config.public.firebaseApiKey || process.env.FIREBASE_API_KEY
      
      if (!firebaseApiKey) {
        console.error('Missing Firebase API key')
        throw new Error('Firebase configuration missing')
      }

      // Call Firebase REST API to verify the token
      const response = await $fetch<{ users?: Array<{ localId: string; email?: string; emailVerified?: boolean }> }>(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseApiKey}`,
        {
          method: 'POST',
          body: { idToken: token }
        }
      )

      if (!response || !response.users || !response.users[0]) {
        throw new Error('Invalid Firebase token')
      }

      const firebaseUser = response.users[0]
      console.log('Firebase token verified:', { uid: firebaseUser.localId, email: firebaseUser.email })

      return {
        uid: firebaseUser.localId,
        email: firebaseUser.email || '',
        email_verified: firebaseUser.emailVerified || false,
        provider: 'firebase'
      }
    } else {
      // Fallback to Supabase token verification
      const { createClient } = await import('@supabase/supabase-js')
      
      const supabaseUrl = config.public.supabaseProjectUrl || process.env.SUPABASE_PROJECT_URL
      const supabaseKey = config.public.supabaseAnonKey || process.env.SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseKey) {
        console.error('Missing Supabase credentials')
        throw new Error('Supabase configuration missing')
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey)
      const { data: { user }, error } = await supabase.auth.getUser(token)
      
      if (error || !user) {
        console.error('Token verification failed:', error?.message)
        throw new Error('Invalid token')
      }
      
      console.log('Supabase token verified:', { id: user.id, email: user.email })
      
      return {
        uid: user.id,
        email: user.email || '',
        email_verified: user.email_confirmed_at ? true : false,
        provider: 'supabase'
      }
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
  
  // Firebase tokens use firebaseUid, Supabase tokens use supabaseUid
  let user = await prisma.user.findUnique({
    where: { supabaseUid: decodedToken.uid },
  })

  // Fallback to firebaseUid
  if (!user) {
    user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
    })
    
    // If found by firebaseUid, update with supabaseUid if using Supabase token
    if (user && !user.supabaseUid && decodedToken.provider === 'supabase') {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { supabaseUid: decodedToken.uid },
      })
    }
  }

  // Fallback to email lookup
  if (!user) {
    user = await prisma.user.findUnique({
      where: { email: decodedToken.email },
    })
    
    if (user && decodedToken.provider === 'firebase') {
      // Update firebaseUid if found by email and using Firebase token
      if (!user.firebaseUid) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { firebaseUid: decodedToken.uid },
        })
      }
    } else if (user && !user.supabaseUid && decodedToken.provider === 'supabase') {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { supabaseUid: decodedToken.uid },
      })
    }
  }

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
