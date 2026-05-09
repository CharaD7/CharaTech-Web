function findMilestoneLabel(invoice: any, phase: string): string {
  const ms = invoice.milestones
  if (Array.isArray(ms)) {
    const match = ms.find((m: any) => m.id === phase || m.phase === phase)
    if (match) return match.label || phase
  }
  return phase === 'ADVANCE_60' ? 'Advance Payment' : 'Final Payment'
}

function updateMilestonePaid(invoice: any, phase: string) {
  const ms = invoice.milestones
  if (!Array.isArray(ms) || ms.length === 0) {
    const field = phase === 'ADVANCE_60' ? 'advancePaidAt' : phase === 'FINAL_40' ? 'finalPaidAt' : null
    if (!field) return null
    return { [field]: new Date() }
  }
  const updated = ms.map((m: any) => {
    if (m.id === phase) return { ...m, paidAt: new Date().toISOString() }
    return m
  })
  return { milestones: updated }
}

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)

    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, message: 'Invoice ID required' })

    const body = await readBody(event)
    const { proofUrl, fileName, fileType, fileSize, phase } = body

    if (!proofUrl || !phase) throw createError({ statusCode: 400, message: 'Proof URL and payment phase required' })

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
    const updateData = updateMilestonePaid(invoice, phase)
    if (updateData) {
      await prisma.invoice.update({
        where: { id },
        data: updateData,
      })
    }

    const phaseLabel = findMilestoneLabel(invoice, phase)

    // Notify admin
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'STATUS_UPDATE',
        channel: ['IN_APP'],
        subject: `Payment proof submitted for ${invoice.invoiceNumber}`,
        message: `${user.fullName || user.email} submitted ${phaseLabel} payment proof for invoice ${invoice.invoiceNumber}.`,
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
