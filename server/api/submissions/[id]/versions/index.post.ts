export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const submissionId = getRouterParam(event, 'id')
  const body = await readBody(event)
  
  if (!submissionId) {
    throw createError({
      statusCode: 400,
      message: 'Submission ID is required'
    })
  }
  
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId }
  })
  
  if (!submission) {
    throw createError({
      statusCode: 404,
      message: 'Submission not found'
    })
  }
  
  if (submission.userId !== user.id && user.role !== 'ADMIN') {
    throw createError({
      statusCode: 403,
      message: 'Not authorized to update this submission'
    })
  }
  
  const newVersion = submission.currentVersion + 1
  
  const version = await prisma.submissionVersion.create({
    data: {
      submissionId,
      version: newVersion,
      data: body.data || submission,
      notes: body.notes || `Version ${newVersion}`,
      createdBy: user.id
    }
  })
  
  await prisma.submission.update({
    where: { id: submissionId },
    data: {
      currentVersion: newVersion,
      requirements: body.requirements || submission.requirements,
      additionalNotes: body.additionalNotes !== undefined ? body.additionalNotes : submission.additionalNotes,
      projectName: body.projectName || submission.projectName
    }
  })
  
  return { version, newVersion }
})
