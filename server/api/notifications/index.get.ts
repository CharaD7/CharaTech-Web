export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  // Ensure dates are properly serialized as ISO strings
  return notifications.map(n => ({
    ...n,
    createdAt: n.createdAt?.toISOString() || new Date().toISOString(),
    readAt: n.readAt?.toISOString() || null,
  }))
})
