export default defineEventHandler(async (event) => {
  try {
    await requireAdmin(event)

    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, message: 'Invoice ID required' })

    const existing = await prisma.invoice.findUnique({ where: { id } })
    if (!existing) throw createError({ statusCode: 404, message: 'Invoice not found' })

    await prisma.paymentProof.deleteMany({ where: { invoiceId: id } })
    await prisma.invoice.delete({ where: { id } })

    return { success: true, message: 'Invoice deleted' }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to delete invoice',
    })
  }
})
