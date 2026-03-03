import { jwtVerify, decodeJwt } from 'jose'

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      error: 'No token provided',
      hasAuth: false,
    }
  }

  const token = authHeader.split('Bearer ')[1]
  const config = useRuntimeConfig()

  // Decode without verification to see the payload
  const decoded = decodeJwt(token)
  
  const response: any = {
    tokenStart: token.substring(0, 30) + '...',
    decodedPayload: decoded,
    jwtSecretConfigured: !!config.supabaseJwtSecret,
    jwtSecretLength: config.supabaseJwtSecret?.length || 0,
  }

  // Try to verify
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(config.supabaseJwtSecret)
    )
    response.verified = true
    response.verifiedPayload = payload
  } catch (error: any) {
    response.verified = false
    response.verificationError = {
      message: error.message,
      code: error.code,
      name: error.name,
    }
  }

  return response
})
