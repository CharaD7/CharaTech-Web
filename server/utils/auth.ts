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

  try {
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
  
  let user = await prisma.user.findUnique({
    where: { supabaseUid: decodedToken.uid },
  })

  if (!user) {
    user = await prisma.user.findUnique({
      where: { email: decodedToken.email },
    })
    
    if (user && !user.supabaseUid) {
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