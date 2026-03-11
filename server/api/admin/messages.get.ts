/** GET /api/admin/messages
 * Returns all conversations grouped by client, with last message and unread count.
 */
export default defineEventHandler(async (event) => {
  const user = await verifyToken(event)
  if (user.role !== 'ADMIN') throw createError({ statusCode: 403, message: 'Admin only' })

  const messages = await prisma.message.findMany({
    where: {
      OR: [{ receiverId: user.id }, { senderId: user.id }],
    },
    orderBy: { createdAt: 'desc' },
  })

  // Group into conversations keyed by the client's userId
  const conversationMap = new Map<string, {
    clientId: string
    lastMessage: string
    lastMessageAt: Date
    unreadCount: number
    isAiHandled: boolean
  }>()

  for (const msg of messages) {
    const clientId = msg.senderId === user.id ? msg.receiverId : msg.senderId
    if (!conversationMap.has(clientId)) {
      conversationMap.set(clientId, {
        clientId,
        lastMessage: msg.content,
        lastMessageAt: msg.createdAt,
        unreadCount: 0,
        isAiHandled: true,
      })
    }
    const conv = conversationMap.get(clientId)!
    if (!msg.read && msg.receiverId === user.id) conv.unreadCount++
    // If admin has ever sent a non-bot reply, conversation is human-handled
    if (msg.senderId === user.id && !msg.isBot) conv.isAiHandled = false
  }

  // Enrich with user info
  const clientIds = [...conversationMap.keys()]
  const clients = clientIds.length
    ? await prisma.user.findMany({
        where: { id: { in: clientIds } },
        select: { id: true, name: true, email: true },
      })
    : []

  const result = [...conversationMap.values()].map(conv => {
    const client = clients.find(c => c.id === conv.clientId)
    return {
      ...conv,
      clientName: client?.name || client?.email?.split('@')[0] || 'Client',
      clientEmail: client?.email || '',
    }
  })

  return result.sort(
    (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
  )
})
