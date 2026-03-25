import { defineEventHandler, readBody } from 'h3'
import { prisma } from '~/server/utils/prisma'
import { verifyAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await verifyAuth(event)
  const body = await readBody(event)
  
  const { submissionId, action } = body
  
  if (!submissionId) {
    throw createError({
      statusCode: 400,
      message: 'Submission ID is required'
    })
  }
  
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId }
  })
  
  if (!submission) {
    throw createError({
      statusCode: 404,
      message: 'Submission not found'
    })
  }
  
  if (action === 'join') {
    const session = await prisma.collabSession.upsert({
      where: { submissionId },
      update: {
        participants: {
          push: user.id
        },
        lastActivity: new Date(),
        isActive: true
      },
      create: {
        submissionId,
        isActive: true,
        participants: [user.id]
      }
    })
    return { session }
  }
  
  if (action === 'leave') {
    const session = await prisma.collabSession.update({
      where: { submissionId },
      data: {
        participants: {
          set: (await prisma.collabSession.findUnique({ where: { submissionId } }))!
            .participants.filter(p => p !== user.id)
        },
        lastActivity: new Date()
      }
    })
    return { session }
  }
  
  if (action === 'close') {
    await prisma.collabSession.update({
      where: { submissionId },
      data: { isActive: false }
    })
    return { success: true }
  }
  
  throw createError({
    statusCode: 400,
    message: 'Invalid action'
  })
})
