export default defineEventHandler(async (event) => {
  try {
    const user = await requireAdmin(event)

    const submissions = await prisma.submission.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            phoneNumber: true,
            companyName: true
          }
        },
        attachments: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return submissions
  } catch (error) {
    console.error('Error fetching submissions:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch submissions'
    })
  }
})
