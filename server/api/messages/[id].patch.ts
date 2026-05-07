/** PATCH /api/messages/:id
 * Edit a message (only by sender, within 15 minutes).
 */
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const messageId = getRouterParam(event, 'id')!
  const { content } = await readBody(event)

  if (!content?.trim()) throw createError({ statusCode: 400, message: 'Content required' })

  const message = await prisma.message.findUnique({ where: { id: messageId } })
  if (!message) throw createError({ statusCode: 404, message: 'Message not found' })
  if (message.senderId !== user.id) throw createError({ statusCode: 403, message: 'Not your message' })
  if (message.deleted) throw createError({ statusCode: 400, message: 'Message deleted' })

  const timeDiff = Date.now() - new Date(message.createdAt).getTime()
  if (timeDiff > 15 * 60 * 1000) throw createError({ statusCode: 400, message: 'Can only edit within 15 minutes' })

  const updated = await prisma.message.update({
    where: { id: messageId },
    data: { content: content.trim(), editedAt: new Date() },
  })

  return { success: true, message: updated }
})
