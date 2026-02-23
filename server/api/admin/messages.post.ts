export default defineEventHandler(async (event) => {
  try {
    const user = await verifyToken(event)
    
    if (user.role !== 'ADMIN') {
      throw createError({
        statusCode: 403,
        message: 'Access denied. Admin only.'
      })
    }

    const { receiverId, submissionId, subject, content } = await readBody(event)

    if (!receiverId || !content) {
      throw createError({
        statusCode: 400,
        message: 'Receiver ID and content are required'
      })
    }

    const message = await prisma.message.create({
      data: {
        senderId: user.id,
        receiverId,
        submissionId,
        subject,
        content
      }
    })

    // Send notification to client
    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: 'STATUS_UPDATE',
        channel: ['EMAIL', 'IN_APP'],
        subject: subject || 'New message from CharaTech',
        message: content
      }
    })

    return { success: true, message }
  } catch (error) {
    console.error('Error sending message:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to send message'
    })
  }
})
