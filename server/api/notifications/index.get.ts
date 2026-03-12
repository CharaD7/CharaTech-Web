export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const notifications = await prisma.notification.findMany({
    where: { 
      userId: user.id,
      archived: false, // Don't show archived notifications
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  // Ensure dates are properly serialized and filter out invalid entries
  return notifications
    .filter(n => n.createdAt) // Only include notifications with valid createdAt
    .map(n => ({
      ...n,
      createdAt: n.createdAt.toISOString(),
      readAt: n.readAt?.toISOString() || null,
      archivedAt: n.archivedAt?.toISOString() || null,
    }))
})
