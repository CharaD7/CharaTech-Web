/** PATCH /api/messages/read
 * Mark all unread messages addressed to the current user as read.
 */
export default defineEventHandler(async (event) => {
  const user = await verifyToken(event)

  const result = await prisma.message.updateMany({
    where: { receiverId: user.id, read: false },
    data: { read: true, readAt: new Date() },
  })

  return { success: true, updated: result.count }
})
