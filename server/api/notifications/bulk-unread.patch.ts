export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)
  const { ids } = body as { ids: string[] }

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'Invalid notification IDs',
    })
  }

  await prisma.notification.updateMany({
    where: {
      id: { in: ids },
      userId: user.id,
    },
    data: {
      read: false,
      readAt: null,
    },
  })

  return { success: true, updated: ids.length }
})
