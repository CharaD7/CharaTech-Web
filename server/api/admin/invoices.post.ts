export default defineEventHandler(async (event) => {
  try {
    const user = await verifyToken(event)
    
    if (user.role !== 'ADMIN') {
      throw createError({
        statusCode: 403,
        message: 'Access denied. Admin only.'
      })
    }

    const body = await readBody(event)
    const {
      submissionId,
      clientId,
      amount,
      taxAmount,
      items,
      notes,
      dueDate
    } = body

    if (!submissionId || !clientId || !amount || !items) {
      throw createError({
        statusCode: 400,
        message: 'Missing required fields'
      })
    }

    // Generate unique invoice number
    const invoiceCount = await prisma.invoice.count()
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(5, '0')}`

    const totalAmount = parseFloat(amount) + (parseFloat(taxAmount) || 0)

    const invoice = await prisma.invoice.create({
      data: {
        submissionId,
        clientId,
        invoiceNumber,
        amount: parseFloat(amount),
        taxAmount: taxAmount ? parseFloat(taxAmount) : null,
        totalAmount,
        status: 'DRAFT',
        items: JSON.parse(JSON.stringify(items)),
        notes,
        dueDate: dueDate ? new Date(dueDate) : null
      }
    })

    // Send notification to client
    await prisma.notification.create({
      data: {
        userId: clientId,
        type: 'QUOTE_READY',
        channel: ['EMAIL', 'IN_APP'],
        subject: `Invoice ${invoiceNumber} Created`,
        message: `A new invoice has been created for your project. Total amount: $${totalAmount}`
      }
    })

    return { success: true, invoice }
  } catch (error) {
    console.error('Error creating invoice:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to create invoice'
    })
  }
})
