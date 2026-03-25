export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const submissionId = getRouterParam(event, 'submissionId')
  const body = await readBody(event)
  
  if (!submissionId) {
    throw createError({
      statusCode: 400,
      message: 'Submission ID is required'
    })
  }
  
  const session = await prisma.collabSession.findUnique({
    where: { submissionId }
  })
  
  if (!session) {
    throw createError({
      statusCode: 404,
      message: 'Session not found'
    })
  }
  
  if (!session.participants.includes(user.id)) {
    throw createError({
      statusCode: 403,
      message: 'Not a participant in this session'
    })
  }
  
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8']
  const userColor = colors[Math.abs(user.id.split('').reduce((a: number, c: string) => a + c.charCodeAt(0), 0)) % colors.length]
  
  const cursor = await prisma.collabCursor.upsert({
    where: {
      sessionId_userId: {
        sessionId: session.id,
        userId: user.id
      }
    },
    update: {
      field: body.field,
      position: body.position,
      updatedAt: new Date()
    },
    create: {
      sessionId: session.id,
      userId: user.id,
      userName: (user.fullName || user.email) as string,
      field: body.field,
      position: body.position,
      color: userColor
    }
  })
  
  await prisma.collabSession.update({
    where: { submissionId },
    data: { lastActivity: new Date() }
  })
  
  return { cursor }
})
