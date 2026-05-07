export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)

    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, message: 'Invoice ID required' })

    const body = await readBody(event)
    const { proofUrl, fileName, fileType, fileSize, phase } = body

    if (!proofUrl || !phase) throw createError({ statusCode: 400, message: 'Proof URL and payment phase required' })
    if (!['ADVANCE_60', 'FINAL_40'].includes(phase)) {
      throw createError({ statusCode: 400, message: 'Phase must be ADVANCE_60 or FINAL_40' })
    }

    const invoice = await prisma.invoice.findUnique({ where: { id } })
    if (!invoice) throw createError({ statusCode: 404, message: 'Invoice not found' })
    if (invoice.clientId !== user.id) throw createError({ statusCode: 403, message: 'Access denied' })

    const proof = await prisma.paymentProof.create({
      data: {
        invoiceId: id,
        fileUrl: proofUrl,
        fileName: fileName || null,
        fileType: fileType || null,
        fileSize: fileSize || null,
        phase,
      },
    })

    // Track when user submitted payment
    const milestoneField = phase === 'ADVANCE_60' ? 'advancePaidAt' : 'finalPaidAt'
    await prisma.invoice.update({
      where: { id },
      data: { [milestoneField]: new Date() },
    })

    // Notify admin
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'STATUS_UPDATE',
        channel: ['IN_APP'],
        subject: `Payment proof submitted for ${invoice.invoiceNumber}`,
        message: `${user.fullName || user.email} submitted ${phase === 'ADVANCE_60' ? '60% advance' : '40% final'} payment proof for invoice ${invoice.invoiceNumber}.`,
      },
    })

    return { success: true, proof }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to submit payment proof',
    })
  }
})
