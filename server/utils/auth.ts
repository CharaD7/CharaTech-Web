import { H3Event } from 'h3'
import { createClient } from '@supabase/supabase-js'
import prisma from './prisma'

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

  try {
    console.log('Attempting to verify token...')
    console.log('Token starts with:', token.substring(0, 50))
    console.log('Supabase URL:', config.public.supabaseProjectUrl)
    console.log('Has Anon Key:', !!config.public.supabaseAnonKey)
    
    // Use Supabase client to verify the token (handles ES256 and HS256)
    const supabaseUrl = config.public.supabaseProjectUrl || process.env.SUPABASE_PROJECT_URL
    const supabaseKey = config.public.supabaseAnonKey || process.env.SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials:', { 
        hasUrl: !!supabaseUrl, 
        hasKey: !!supabaseKey 
      })
      throw new Error('Supabase configuration missing')
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      console.error('Token verification failed:', error?.message)
      throw new Error('Invalid token')
    }
    
    console.log('Token verified successfully:', { id: user.id, email: user.email })
    
    return {
      uid: user.id,
      email: user.email || '',
      email_verified: user.email_confirmed_at ? true : false,
    }
  } catch (error: any) {
    console.error('JWT verification error details:', {
      message: error.message,
      code: error.code,
      name: error.name
    })
    throw createError({
      statusCode: 401,
      message: 'Invalid token',
    })
  }
}

export const requireAuth = async (event: H3Event) => {
  const decodedToken = await verifyToken(event)
  
  // Try to find user by supabaseUid first, then fallback to firebaseUid
  let user = await prisma.user.findUnique({
    where: { supabaseUid: decodedToken.uid },
  })

  // Fallback to firebaseUid for backward compatibility
  if (!user) {
    user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
    })
    
    // If found by firebaseUid, update with supabaseUid
    if (user && !user.supabaseUid) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { supabaseUid: decodedToken.uid },
      })
    }
  }

  // If still not found, try by email and update
  if (!user) {
    user = await prisma.user.findUnique({
      where: { email: decodedToken.email },
    })
    
    if (user) {
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
