const VALID_STATUSES = ['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED']

const buildInvoiceEmail = (invoice: any, client: any) => {
  const sym: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', GHS: '₵', CAD: 'C$', AUD: 'A$' }
  const cur = sym[invoice.currency] || '$'
  const fmt = (n: number) => `${cur}${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
  const items: any[] = Array.isArray(invoice.items) ? invoice.items : []
  const dueDate = invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Upon receipt'
  const taxLine = invoice.taxAmount && invoice.taxAmount > 0
    ? `<tr><td style="padding:6px 0;color:#a78bfa;">Tax / Levy</td><td style="padding:6px 0;text-align:right;color:#a78bfa;">${fmt(invoice.taxAmount)}</td></tr>`
    : ''

  const itemRows = items.map((item: any) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);color:#e2e8f0;">${item.description}</td>
      <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);text-align:center;color:#94a3b8;">${item.quantity}</td>
      <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);text-align:right;color:#94a3b8;">${fmt(item.unitPrice)}</td>
      <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);text-align:right;color:#c4b5fd;font-weight:600;">${fmt(item.total)}</td>
    </tr>`).join('')

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f0a1e;font-family:'Segoe UI',system-ui,sans-serif;">
  <div style="max-width:680px;margin:0 auto;padding:40px 20px;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1e0a3c,#2d0b55);border-radius:16px 16px 0 0;padding:36px 40px;border:1px solid rgba(168,85,247,0.3);border-bottom:none;">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;">
        <div>
          <div style="font-size:28px;font-weight:800;background:linear-gradient(90deg,#c084fc,#f472b6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;letter-spacing:-0.5px;">CharaTech</div>
          <div style="color:#94a3b8;font-size:13px;margin-top:4px;">Software Requirements & Development</div>
        </div>
        <div style="text-align:right;">
          <div style="background:linear-gradient(135deg,rgba(168,85,247,0.2),rgba(219,39,119,0.2));border:1px solid rgba(168,85,247,0.4);border-radius:10px;padding:10px 18px;">
            <div style="color:#c084fc;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Invoice</div>
            <div style="color:#fff;font-size:18px;font-weight:700;font-family:monospace;">${invoice.invoiceNumber}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Invoice Meta -->
    <div style="background:rgba(15,10,30,0.95);border:1px solid rgba(168,85,247,0.15);border-top:none;border-bottom:none;padding:24px 40px;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
        <div>
          <div style="color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Billed To</div>
          <div style="color:#f1f5f9;font-weight:600;">${client?.fullName || 'Valued Client'}</div>
          <div style="color:#94a3b8;font-size:13px;">${client?.email || ''}</div>
          ${client?.companyName ? `<div style="color:#94a3b8;font-size:13px;">${client.companyName}</div>` : ''}
        </div>
        <div style="text-align:right;">
          <div style="color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Payment Due</div>
          <div style="color:#f472b6;font-weight:700;font-size:16px;">${dueDate}</div>
          <div style="margin-top:12px;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Status</div>
          <div style="display:inline-block;margin-top:4px;background:rgba(59,130,246,0.2);border:1px solid rgba(59,130,246,0.4);border-radius:6px;padding:3px 10px;color:#93c5fd;font-size:12px;font-weight:600;">${invoice.status}</div>
        </div>
      </div>
    </div>

    <!-- Line Items Table -->
    <div style="background:rgba(15,10,30,0.95);border:1px solid rgba(168,85,247,0.15);border-top:none;border-bottom:none;padding:0 40px 24px;">
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="border-bottom:1px solid rgba(168,85,247,0.2);">
            <th style="padding:10px 0;text-align:left;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Description</th>
            <th style="padding:10px 0;text-align:center;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Qty</th>
            <th style="padding:10px 0;text-align:right;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Unit Price</th>
            <th style="padding:10px 0;text-align:right;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Total</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
    </div>

    <!-- Totals -->
    <div style="background:rgba(15,10,30,0.95);border:1px solid rgba(168,85,247,0.15);border-top:1px solid rgba(168,85,247,0.2);border-bottom:none;padding:20px 40px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:6px 0;color:#94a3b8;">Subtotal</td>
          <td style="padding:6px 0;text-align:right;color:#e2e8f0;">${fmt(invoice.amount)}</td>
        </tr>
        ${taxLine}
        <tr style="border-top:1px solid rgba(168,85,247,0.3);">
          <td style="padding:14px 0 6px;color:#fff;font-weight:700;font-size:18px;">Total Due</td>
          <td style="padding:14px 0 6px;text-align:right;font-weight:800;font-size:22px;background:linear-gradient(90deg,#c084fc,#f472b6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">${fmt(invoice.totalAmount)}</td>
        </tr>
      </table>
    </div>

    ${invoice.notes ? `
    <!-- Notes -->
    <div style="background:rgba(15,10,30,0.95);border:1px solid rgba(168,85,247,0.15);border-top:none;border-bottom:none;padding:16px 40px;">
      <div style="color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Notes</div>
      <div style="color:#94a3b8;font-size:13px;line-height:1.6;">${invoice.notes}</div>
    </div>` : ''}

    <!-- CTA -->
    <div style="background:linear-gradient(135deg,#1e0a3c,#2d0b55);border:1px solid rgba(168,85,247,0.3);border-top:none;border-radius:0 0 16px 16px;padding:32px 40px;text-align:center;">
      <p style="color:#94a3b8;margin:0 0 20px;font-size:14px;">To discuss payment or ask questions, reply directly to this email or contact us below.</p>
      <a href="mailto:hello@charatech.com" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#db2777);color:#fff;text-decoration:none;padding:14px 36px;border-radius:10px;font-weight:700;font-size:15px;letter-spacing:0.3px;">Contact CharaTech →</a>
      <p style="color:#4b5563;font-size:11px;margin:24px 0 0;">CharaTech · Software Requirements Platform · hello@charatech.com</p>
    </div>

  </div>
</body>
</html>`
}

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

    // Notify client when invoice is sent — including rich HTML email
    if (status === 'SENT') {
      const client = await prisma.user.findUnique({
        where: { id: invoice.clientId },
        select: { id: true, email: true, fullName: true, companyName: true },
      })

      await prisma.notification.create({
        data: {
          userId: invoice.clientId,
          type: 'QUOTE_READY',
          channel: ['EMAIL', 'IN_APP'],
          subject: `Invoice ${invoice.invoiceNumber} — Action Required`,
          message: `Your invoice ${invoice.invoiceNumber} for ${invoice.currency} ${invoice.totalAmount.toFixed(2)} is ready. Please review and complete payment by ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'the due date'}.`,
        },
      })

      if (client?.email) {
        const html = buildInvoiceEmail(invoice, client)
        await sendEmail(
          client.email,
          `Invoice ${invoice.invoiceNumber} from CharaTech — ${invoice.currency} ${invoice.totalAmount.toFixed(2)}`,
          html
        )
      }
    }

    return { success: true, invoice }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to update invoice',
    })
  }
})
