export default defineEventHandler(async (event) => {
  try {
    const user = await verifyToken(event)
    
    if (user.role !== 'ADMIN') {
      throw createError({
        statusCode: 403,
        message: 'Access denied. Admin only.'
      })
    }

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
