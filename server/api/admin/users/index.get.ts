export default defineEventHandler(async (event) => {
  try {
    await requireAdmin(event)
  } catch (error: any) {
    console.error('Admin auth failed:', error.message)
    throw error
  }

  const query = getQuery(event)
  const userId = query.id as string | undefined

  try {
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
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('Database error:', error.message)
    throw createError({
      statusCode: 500,
      message: 'Database error occurred',
    })
  }
})