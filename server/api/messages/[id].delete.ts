/** DELETE /api/messages/:id
 * Soft-delete a message (only by sender).
 */
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const messageId = getRouterParam(event, 'id')!

  const message = await prisma.message.findUnique({ where: { id: messageId } })
  if (!message) throw createError({ statusCode: 404, message: 'Message not found' })
  if (message.senderId !== user.id) throw createError({ statusCode: 403, message: 'Not your message' })
  if (message.deleted) throw createError({ statusCode: 400, message: 'Already deleted' })

  await prisma.message.update({
    where: { id: messageId },
    data: { deleted: true, content: '[Message deleted]' },
  })

  return { success: true }
})
