export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const query = getQuery(event)
  const userId = query.id as string | undefined

  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        submissions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        calendlyBookings: {
          orderBy: { startTime: 'desc' },
          take: 10,
        },
        notifications: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        _count: {
          select: {
            submissions: true,
            notifications: true,
            calendlyBookings: true,
          },
        },
      },
    })

    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'User not found',
      })
    }

    return user
  }

  const users = await prisma.user.findMany({
    where: {
      role: 'CLIENT',
    },
    orderBy: { createdAt: 'desc' },
    include: {
      submissions: {
        select: {
          id: true,
          projectName: true,
          status: true,
          industry: true,
          createdAt: true,
        },
      },
      _count: {
        select: {
          submissions: true,
          notifications: true,
        },
      },
    },
  })

  return users
})