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

  if (user.role === 'ADMIN') {
    throw createError({
      statusCode: 400,
      message: 'Cannot delete admin user',
    })
  }

  await prisma.user.delete({
    where: { id },
  })

  return { success: true, message: 'User deleted successfully' }
})