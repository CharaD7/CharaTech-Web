const VALID_STATUSES = ['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED']

export default defineEventHandler(async (event) => {
  try {
    await requireAdmin(event)

    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, message: 'Invoice ID required' })

    const body = await readBody(event)
    const { status } = body

    if (!status || !VALID_STATUSES.includes(status)) {
      throw createError({ statusCode: 400, message: `Status must be one of: ${VALID_STATUSES.join(', ')}` })
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        status,
        ...(status === 'PAID' && { paidAt: new Date() }),
      },
    })

    // Notify client when invoice is sent
    if (status === 'SENT') {
      await prisma.notification.create({
        data: {
          userId: invoice.clientId,
          type: 'QUOTE_READY',
          channel: ['EMAIL', 'IN_APP'],
          subject: `Invoice ${invoice.invoiceNumber} Sent`,
          message: `Your invoice ${invoice.invoiceNumber} for ${invoice.currency} ${invoice.totalAmount.toFixed(2)} is ready. Please review and complete payment.`,
        },
      })
    }

    return { success: true, invoice }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to update invoice',
    })
  }
})
