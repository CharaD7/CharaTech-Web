import { H3Event } from 'h3'
import { jwtVerify, createRemoteJWKSet, decodeJwt } from 'jose'
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

  if (!config.supabaseJwtSecret) {
    throw createError({
      statusCode: 500,
      message: 'Supabase JWT secret is not configured.',
    })
  }

  try {
    console.log('Attempting to verify token...')
    console.log('Token starts with:', token.substring(0, 50))
    
    // Decode header to check algorithm
    const header = JSON.parse(Buffer.from(token.split('.')[0], 'base64').toString())
    console.log('Token algorithm:', header.alg)
    
    let payload
    
    if (header.alg === 'ES256') {
      // ES256 tokens use JWKS endpoint
      const JWKS = createRemoteJWKSet(new URL(`${config.public.supabaseProjectUrl}/auth/v1/jwks`))
      const { payload: verifiedPayload } = await jwtVerify(token, JWKS)
      payload = verifiedPayload
    } else {
      // HS256 or other HMAC algorithms use the JWT secret
      const { payload: verifiedPayload } = await jwtVerify(
        token,
        new TextEncoder().encode(config.supabaseJwtSecret)
      )
      payload = verifiedPayload
    }
    
    console.log('Token verified successfully:', { sub: payload.sub, email: payload.email })
    
    // Supabase JWTs use 'sub' for user ID and 'email' for email
    return {
      uid: payload.sub as string,
      email: payload.email as string,
      email_verified: payload.email_verified as boolean || false,
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
