/** GET /api/admin/messages/:userId
 * Returns full message thread between ANY admin and a specific client.
 * Marks all incoming messages as read.
 */
export default defineEventHandler(async (event) => {
  try {
    const admin = await requireAdmin(event)

    const clientId = getRouterParam(event, 'userId')!

    // Get ALL admin IDs
    const allAdmins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    })
    const adminIds = allAdmins.map(a => a.id)

    const messages = await prisma.message.findMany({
      where: {
        deleted: false,
        OR: [
          { senderId: { in: adminIds }, receiverId: clientId },
          { senderId: clientId, receiverId: { in: adminIds } },
        ],
      },
      orderBy: { createdAt: 'asc' },
    })

    // Mark client's messages to all admins as read
    await prisma.message.updateMany({
      where: { senderId: clientId, receiverId: { in: adminIds }, read: false },
      data: { read: true, readAt: new Date() },
    })

    const client = await prisma.user.findUnique({
      where: { id: clientId },
      select: { id: true, fullName: true, email: true },
    })

    // Determine if ANY admin has sent a real reply
    const adminHasReplied = messages.some(m => adminIds.includes(m.senderId) && !m.isBot)

    return { messages, client, adminId: admin.id, allAdminIds: adminIds, isAiHandled: !adminHasReplied }
  } catch (error: any) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Server Error',
        message: error.message || 'Failed to fetch messages',
      })
  }
})
