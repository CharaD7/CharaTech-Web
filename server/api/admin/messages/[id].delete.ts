/** DELETE /api/admin/messages/:id
 * Admin can delete any message.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const messageId = getRouterParam(event, 'id')!

  const message = await prisma.message.findUnique({ where: { id: messageId } })
  if (!message) throw createError({ statusCode: 404, message: 'Message not found' })

  await prisma.message.update({
    where: { id: messageId },
    data: { deleted: true, content: '[Message deleted by admin]' },
  })

  return { success: true }
})
