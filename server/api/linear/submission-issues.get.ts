export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  
  const query = getQuery(event)
  const submissionId = query.submissionId as string
  
  if (!submissionId) {
    throw createError({
      statusCode: 400,
      message: 'Submission ID is required'
    })
  }
  
  const issues = await prisma.linearIssue.findMany({
    where: { submissionId },
    orderBy: { linearNumber: 'asc' }
  })
  
  return { issues }
})
