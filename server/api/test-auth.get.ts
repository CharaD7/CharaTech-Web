export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader) {
    throw createError({ statusCode: 401, message: 'No auth header' })
  }
  const token = authHeader.replace('Bearer ', '')
  try {
    const user = await verifyToken(token)
    return { user }
  } catch (error: any) {
    throw createError({ statusCode: 401, message: 'Invalid token' })
  }
})
