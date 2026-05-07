/**
 * GET /api/admin/messages
 * Returns ALL conversations grouped by client, with last message and unread count.
 * Shows conversations from ALL admins.
 */
export default defineEventHandler(async (event) => {
  try {
    const user = await requireAdmin(event)

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
          { receiverId: { in: adminIds } },
          { senderId: { in: adminIds } },
        ],
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
      const isAdminSender = adminIds.includes(msg.senderId)
      const clientId = isAdminSender ? msg.receiverId : msg.senderId
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
      if (!msg.read && adminIds.includes(msg.receiverId)) conv.unreadCount++
      // If ANY admin has ever sent a non-bot reply, conversation is human-handled
      if (isAdminSender && !msg.isBot) conv.isAiHandled = false
    }

    // Enrich with user info
    const clientIds = [...conversationMap.keys()]
    const clients = clientIds.length
      ? await prisma.user.findMany({
          where: { id: { in: clientIds } },
          select: { id: true, fullName: true, email: true },
        })
      : []

    const result = [...conversationMap.values()].map(conv => {
      const client = clients.find(c => c.id === conv.clientId)
      return {
        ...conv,
        clientName: client?.fullName || client?.email?.split('@')[0] || 'Client',
        clientEmail: client?.email || '',
      }
    })

    return result.sort(
      (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    )
  } catch (error: any) {
      throw createError({
        statusCode: error.statusCode || 500,
        message: error.message || 'Failed to fetch messages'
      })
  }
})
