/** POST /api/messages
 * Client sends a message to admin.
 * If admin has never replied (AI mode), auto-responds via OpenAI with a fallback.
 */
import { chatWithAI } from '../../../server/utils/openai'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const { content } = await readBody(event)

  if (!content?.trim()) throw createError({ statusCode: 400, message: 'Message content required' })

  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
    select: { id: true },
  })
  if (!admin) throw createError({ statusCode: 500, message: 'No admin configured' })

  // Save client message
  const message = await prisma.message.create({
    data: {
      senderId: user.id,
      receiverId: admin.id,
      content: content.trim(),
      isBot: false,
    },
  })

  // Detect AI mode: admin has never sent a human (non-bot) reply to this client
  const adminHasReplied = await prisma.message.findFirst({
    where: { senderId: admin.id, receiverId: user.id, isBot: false },
  })

  let botReply: any = null
  if (!adminHasReplied) {
    // AI mode — try OpenAI, fall back to a canned response
    let botContent =
      "Thanks for reaching out to CharaTech! I'm Chara, your AI assistant. How can I help you today? Feel free to tell me about your software project requirements."

    try {
      const config = useRuntimeConfig()
      const openaiApiKey = config.openaiApiKey as string | undefined
      if (openaiApiKey) {
        // Attempt OpenAI
        const result = await chatWithAI(content.trim())
        if (result.success && result.response) {
          botContent = result.response
        }
      }
    } catch {
      // OpenAI unavailable — use default canned response
    }

    botReply = await prisma.message.create({
      data: {
        senderId: admin.id,
        receiverId: user.id,
        content: botContent,
        isBot: true,
      },
    })
  } else {
    // Human mode — notify admin of new message
    await prisma.notification.create({
      data: {
        userId: admin.id,
        type: 'STATUS_UPDATE',
        channel: ['IN_APP'],
        subject: 'New message from client',
        message: `${user.email || 'A client'} sent: ${content.trim().slice(0, 80)}${content.length > 80 ? '…' : ''}`,
      },
    })
  }

  return { message, botReply }
})
