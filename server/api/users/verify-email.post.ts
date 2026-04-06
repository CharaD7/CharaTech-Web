export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
    },
  })

  return {
    success: true,
    emailVerified: updated.emailVerified,
  }
})
