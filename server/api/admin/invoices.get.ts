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

    // Enrich with submission info
    const submissionIds = invoices.map((i) => i.submissionId).filter(Boolean)
    const submissions =
      submissionIds.length > 0
        ? await prisma.submission.findMany({
            where: { id: { in: submissionIds } },
            include: {
              attachments: {
                orderBy: { createdAt: 'desc' }
              }
            },
          })
        : []
    const subMap = Object.fromEntries(submissions.map((s) => [s.id, s]))

    const enriched = invoices.map((inv) => ({
      ...inv,
      client: userMap[inv.clientId] ?? {
        fullName: 'Unknown Client',
        email: '',
        companyName: '',
      },
      submission: subMap[inv.submissionId] ?? null,
    }))

    return { success: true, invoices: enriched }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch invoices',
    })
  }
})
