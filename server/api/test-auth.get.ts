export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  
  console.log('Auth header:', authHeader)
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      success: false,
      error: 'No authorization header'
    }
  }

  const token = authHeader.split('Bearer ')[1]
  console.log('Token (first 50 chars):', token.substring(0, 50) + '...')

  try {
    const decodedToken = await verifyToken(event)
    console.log('Decoded token:', decodedToken)
    
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
    })
    
    console.log('User found:', user)
    
    return {
      success: true,
      decodedToken,
      user
    }
  } catch (error: any) {
    console.error('Test error:', error)
    return {
      success: false,
      error: error.message,
      stack: error.stack
    }
  }
})
