export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  await prisma.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true, readAt: new Date() },
  })

  return { success: true }
})
