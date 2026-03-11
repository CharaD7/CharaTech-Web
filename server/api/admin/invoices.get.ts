export default defineEventHandler(async (event) => {
  try {
    await requireAdmin(event)

    const invoices = await prisma.invoice.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    const clientIds = [...new Set(invoices.map((i) => i.clientId))]
    const users =
      clientIds.length > 0
        ? await prisma.user.findMany({
            where: { id: { in: clientIds } },
            select: { id: true, fullName: true, email: true, companyName: true },
          })
        : []

    const userMap = Object.fromEntries(users.map((u) => [u.id, u]))

    const enriched = invoices.map((inv) => ({
      ...inv,
      client: userMap[inv.clientId] ?? {
        fullName: 'Unknown Client',
        email: '',
        companyName: '',
      },
    }))

    return { success: true, invoices: enriched }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch invoices',
    })
  }
})
