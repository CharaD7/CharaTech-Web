/** GET /api/messages
 * Client: retrieve own message thread with admin (including bot replies).
 * Marks incoming messages as read.
 */
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  // Find the first admin user
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
    select: { id: true, fullName: true },
  })
  if (!admin) return { messages: [], adminId: null, isAiHandled: true }

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: user.id, receiverId: admin.id },
        { senderId: admin.id, receiverId: user.id },
      ],
    },
    orderBy: { createdAt: 'asc' },
  })

  // Mark admin/bot messages as read
  await prisma.message.updateMany({
    where: { receiverId: user.id, read: false },
    data: { read: true, readAt: new Date() },
  })

  const isAiHandled = !messages.some(m => m.senderId === admin.id && !m.isBot)

  return { messages, adminId: admin.id, adminName: admin.fullName || 'CharaTech Support', isAiHandled }
})
