/** POST /api/admin/messages
 * Admin sends a message to client. Supports file attachments.
 */
export default defineEventHandler(async (event) => {
  try {
    const user = await requireAdmin(event)

    const { receiverId, submissionId, subject, content, fileUrl, fileName } = await readBody(event)

    if (!receiverId || (!content?.trim() && !fileUrl)) {
      throw createError({
        statusCode: 400,
        message: 'Receiver ID and content or file are required'
      })
    }

    const messageContent = content?.trim() || (fileUrl ? `📎 ${fileName || 'File attached'}` : '')

    const message = await prisma.message.create({
      data: {
        senderId: user.id,
        receiverId,
        submissionId,
        subject,
        content: messageContent,
        fileUrl: fileUrl || null,
        fileName: fileName || null,
      }
    })

    // Notify client via email + in-app
    const client = await prisma.user.findUnique({ where: { id: receiverId } })
    if (client) {
      await sendEmail(
        client.email,
        subject || 'New message from CharaTech',
        `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
            <h2>${subject || 'New message from CharaTech'}</h2>
            <p>Hi ${client.fullName || 'there'},</p>
            <p>${messageContent}</p>
            <hr style="border:none;border-top:1px solid #eee;margin:20px 0"/>
            <p style="color:#888;font-size:12px">Log in to your CharaTech dashboard to reply.</p>
          </div>
        `
      )
    }

    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: 'MESSAGE_RECEIVED',
        channel: ['EMAIL', 'IN_APP'],
        subject: subject || 'New message from CharaTech',
        message: messageContent.length > 120 ? messageContent.slice(0, 120) + '…' : messageContent,
        metadata: { messageId: message.id, submissionId: submissionId || null },
        sentAt: new Date(),
      }
    })

    return { success: true, message }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to send message'
    })
  }
})
