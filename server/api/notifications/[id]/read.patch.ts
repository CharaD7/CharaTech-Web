export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')

  const notification = await prisma.notification.findUnique({
    where: { id },
  })

  if (!notification || notification.userId !== user.id) {
    throw createError({
      statusCode: 404,
      message: 'Notification not found',
    })
  }

  const updated = await prisma.notification.update({
    where: { id },
    data: {
      read: true,
      readAt: new Date(),
    },
  })

  return updated
})
