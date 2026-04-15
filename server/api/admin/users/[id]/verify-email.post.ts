export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'User ID required',
    })
  }

  const user = await prisma.user.findUnique({
    where: { id },
  })

  if (!user) {
    throw createError({
      statusCode: 404,
      message: 'User not found',
    })
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { emailVerified: true },
  })

  return { success: true, message: 'User email verified successfully', user: updated }
})