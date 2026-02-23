export default defineEventHandler(async (event) => {
  try {
    const user = await verifyToken(event)
    
    if (user.role !== 'ADMIN') {
      throw createError({
        statusCode: 403,
        message: 'Access denied. Admin only.'
      })
    }

    const body = await readBody(event)
    const {
      submissionId,
      startDate,
      endDate,
      milestones
    } = body

    if (!submissionId || !milestones || !Array.isArray(milestones)) {
      throw createError({
        statusCode: 400,
        message: 'Submission ID and milestones array are required'
      })
    }

    const timeline = await prisma.projectTimeline.create({
      data: {
        submissionId,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status: 'PLANNING',
        milestones: {
          create: milestones.map((m: any, index: number) => ({
            title: m.title,
            description: m.description,
            startDate: new Date(m.startDate),
            endDate: new Date(m.endDate),
            status: 'PENDING',
            order: index
          }))
        }
      },
      include: {
        milestones: true
      }
    })

    // Get submission details for notification
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { user: true }
    })

    // Send notification to client
    if (submission) {
      await prisma.notification.create({
        data: {
          userId: submission.userId,
          type: 'STATUS_UPDATE',
          channel: ['EMAIL', 'IN_APP'],
          subject: 'Project Timeline Created',
          message: `A project timeline has been created for "${submission.projectName}" with ${milestones.length} milestones.`
        }
      })
    }

    return { success: true, timeline }
  } catch (error) {
    console.error('Error creating timeline:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to create timeline'
    })
  }
})
