export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)

    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, message: 'Invoice ID required' })

    const body = await readBody(event)
    const { requestType, message } = body

    if (!requestType || !['MORE_INFO', 'ALTERNATE_ACCOUNT'].includes(requestType)) {
      throw createError({ statusCode: 400, message: 'Request type must be MORE_INFO or ALTERNATE_ACCOUNT' })
    }

    const invoice = await prisma.invoice.findUnique({ where: { id } })
    if (!invoice) throw createError({ statusCode: 404, message: 'Invoice not found' })
    if (invoice.clientId !== user.id) throw createError({ statusCode: 403, message: 'Access denied' })

    const updated = await prisma.invoice.update({
      where: { id },
      data: {
        infoRequestType: requestType,
        infoRequestMessage: message || null,
        infoRequestResolved: false,
      },
    })

    // Notify admin
    const requestLabel = requestType === 'MORE_INFO' ? 'more information' : 'alternate bank account'
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'STATUS_UPDATE',
        channel: ['IN_APP'],
        subject: `Info request for ${invoice.invoiceNumber}`,
        message: `${user.fullName || user.email} requested ${requestLabel} for invoice ${invoice.invoiceNumber}.`,
      },
    })

    return { success: true, invoice: updated }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to submit info request',
    })
  }
})
