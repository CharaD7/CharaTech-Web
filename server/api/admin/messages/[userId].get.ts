/** GET /api/admin/messages/:userId
 * Returns full message thread between admin and a specific client.
 * Marks all incoming messages as read.
 */
export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)

  const clientId = getRouterParam(event, 'userId')!

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: user.id, receiverId: clientId },
        { senderId: clientId, receiverId: user.id },
      ],
    },
    orderBy: { createdAt: 'asc' },
  })

  // Mark client's messages to admin as read
  await prisma.message.updateMany({
    where: { senderId: clientId, receiverId: user.id, read: false },
    data: { read: true, readAt: new Date() },
  })

  const client = await prisma.user.findUnique({
    where: { id: clientId },
    select: { id: true, name: true, email: true },
  })

  // Determine if this conversation is AI-handled (admin hasn't sent a real reply yet)
  const adminHasReplied = messages.some(m => m.senderId === user.id && !m.isBot)

  return { messages, client, adminId: user.id, isAiHandled: !adminHasReplied }
})
