export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')

  const submission = await prisma.submission.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
          companyName: true,
        },
      },
    },
  })

  if (!submission) {
    throw createError({
      statusCode: 404,
      message: 'Submission not found',
    })
  }

  if (submission.userId !== user.id && user.role !== 'ADMIN') {
    throw createError({
      statusCode: 403,
      message: 'Access denied',
    })
  }

  return submission
})
