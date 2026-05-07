/** POST /api/messages
 * Client sends a message to admin.
 * If no admin has ever replied (AI mode), auto-responds via Ollama with a fallback.
 */
import { chatWithAI } from '~~/server/utils/openai'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const { content, fileUrl, fileName } = await readBody(event)

  if (!content?.trim() && !fileUrl) throw createError({ statusCode: 400, message: 'Message content or file required' })

  // Find ALL admins — pick the first one as the "system admin" for AI replies
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { id: true },
  })
  if (!admins.length) throw createError({ statusCode: 500, message: 'No admin configured' })

  // Use the first admin as the primary recipient (any admin can see/reply)
  const primaryAdminId = admins[0].id
  const adminIds = admins.map(a => a.id)

  const messageContent = content?.trim() || (fileUrl ? `📎 ${fileName || 'File attached'}` : '')

  // Save client message
  const message = await prisma.message.create({
    data: {
      senderId: user.id,
      receiverId: primaryAdminId,
      content: messageContent,
      fileUrl: fileUrl || null,
      fileName: fileName || null,
      isBot: false,
    },
  })

  // Detect AI mode: NO admin has ever sent a human (non-bot) reply to this client
  const adminHasReplied = await prisma.message.findFirst({
    where: { senderId: { in: adminIds }, receiverId: user.id, isBot: false },
  })

  let botReply: any = null
  if (!adminHasReplied) {
    // AI mode — try Ollama, fall back to a canned response
    let botContent =
      "Thanks for reaching out to CharaTech! I'm Chara, your AI assistant. How can I help you today? Feel free to tell me about your software project requirements."

    try {
      const config = useRuntimeConfig()
      const ollamaApiKey = config.ollamaApiKey as string | undefined
      if (ollamaApiKey) {
        const result = await chatWithAI(content?.trim() || '')
        if (result.success && result.response) {
          botContent = result.response
        }
      }
    } catch {
      // Ollama unavailable — use default canned response
    }

    botReply = await prisma.message.create({
      data: {
        senderId: primaryAdminId,
        receiverId: user.id,
        content: botContent,
        isBot: true,
      },
    })
  } else {
    // Human mode — notify the primary admin of new message
    await prisma.notification.create({
      data: {
        userId: primaryAdminId,
        type: 'STATUS_UPDATE',
        channel: ['IN_APP'],
        subject: 'New message from client',
        message: `${user.email || 'A client'} sent: ${messageContent.slice(0, 80)}${messageContent.length > 80 ? '…' : ''}`,
      },
    })
  }

  return { message, botReply }
})
