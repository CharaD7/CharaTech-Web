export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)

    const invoices = await prisma.invoice.findMany({
      where: { clientId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    // Enrich with submission project name
    const submissionIds = invoices.map((i) => i.submissionId).filter(Boolean)
    const submissions =
      submissionIds.length > 0
        ? await prisma.submission.findMany({
            where: { id: { in: submissionIds } },
            select: { id: true, projectName: true, industry: true, complexity: true },
          })
        : []
    const subMap = Object.fromEntries(submissions.map((s) => [s.id, s]))

    const enriched = invoices.map((inv) => ({
      ...inv,
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
