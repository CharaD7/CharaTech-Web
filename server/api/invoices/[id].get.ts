export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)
    const id = getRouterParam(event, 'id')

    if (!id) throw createError({ statusCode: 400, message: 'Invoice ID required' })

    const invoice = await prisma.invoice.findUnique({ where: { id } })

    if (!invoice) throw createError({ statusCode: 404, message: 'Invoice not found' })

    // Clients can only view their own invoices
    if (invoice.clientId !== user.id) {
      throw createError({ statusCode: 403, message: 'Access denied' })
    }

    // Enrich with submission info
    const submission = invoice.submissionId
      ? await prisma.submission.findUnique({
          where: { id: invoice.submissionId },
          select: { id: true, projectName: true, industry: true, complexity: true, projectType: true },
        })
      : null

    return { success: true, invoice: { ...invoice, submission } }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch invoice',
    })
  }
})
