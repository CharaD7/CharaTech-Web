import { sendEmail } from '~/server/utils/email'

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
      currency,
      items,
      notes,
      dueDate,
      status: requestedStatus,
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
        currency: currency || 'USD',
        taxAmount: taxAmount ? parseFloat(taxAmount) : null,
        totalAmount,
        status: requestedStatus || 'DRAFT',
        items: JSON.parse(JSON.stringify(items)),
        notes,
        dueDate: dueDate ? new Date(dueDate) : null
      }
    })

    // Notify client with email + in-app
    const client = await prisma.user.findUnique({ where: { id: clientId } })
    if (client) {
      await sendEmail(
        client.email,
        `Invoice ${invoiceNumber} Created`,
        `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
            <h2>Invoice Created</h2>
            <p>Hi ${client.fullName || 'there'},</p>
            <p>A new invoice <strong>${invoiceNumber}</strong> has been created for your project.</p>
            <p><strong>Total Amount:</strong> ${currency || 'USD'} ${totalAmount.toFixed(2)}</p>
            ${dueDate ? `<p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>` : ''}
            <p>You will receive a separate email when the invoice is formally sent to you.</p>
          </div>
        `
      )
    }

    await prisma.notification.create({
      data: {
        userId: clientId,
        type: 'INVOICE_GENERATED',
        channel: ['EMAIL', 'IN_APP'],
        subject: `Invoice ${invoiceNumber} Created`,
        message: `A new invoice has been created for your project. Total: ${currency || 'USD'} ${totalAmount.toFixed(2)}`,
        metadata: { invoiceId: invoice.id, invoiceNumber, amount: totalAmount, submissionId },
        sentAt: new Date(),
      },
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
