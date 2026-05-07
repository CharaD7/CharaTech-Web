/** GET /api/messages
 * Client: retrieve own message thread with any admin (including bot replies).
 * Marks incoming messages as read.
 */
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  // Find ALL admin users
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { id: true, fullName: true },
  })
  if (!admins.length) return { messages: [], adminIds: [], isAiHandled: true }

  const adminIds = admins.map(a => a.id)

  const messages = await prisma.message.findMany({
    where: {
      deleted: false,
      OR: [
        { senderId: user.id, receiverId: { in: adminIds } },
        { senderId: { in: adminIds }, receiverId: user.id },
      ],
    },
    orderBy: { createdAt: 'asc' },
  })

  // Mark admin/bot messages as read
  await prisma.message.updateMany({
    where: { receiverId: user.id, senderId: { in: adminIds }, read: false },
    data: { read: true, readAt: new Date() },
  })

  const isAiHandled = !messages.some(m => adminIds.includes(m.senderId) && !m.isBot)

  return { messages, adminIds, adminName: admins[0]?.fullName || 'CharaTech Support', isAiHandled }
})
