export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const submissionId = getRouterParam(event, 'submissionId')
  
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
    return { session: null, cursors: [] }
  }
  
  const cursors = await prisma.collabCursor.findMany({
    where: { sessionId: session.id }
  })
  
  return { session, cursors }
})
