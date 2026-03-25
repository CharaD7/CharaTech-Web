import { defineEventHandler, getRouterParam } from 'h3'
import { prisma } from '~/server/utils/prisma'
import { verifyAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await verifyAuth(event)
  const submissionId = getRouterParam(event, 'id')
  
  if (!submissionId) {
    throw createError({
      statusCode: 400,
      message: 'Submission ID is required'
    })
  }
  
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      versions: {
        orderBy: { version: 'desc' }
      }
    }
  })
  
  if (!submission) {
    throw createError({
      statusCode: 404,
      message: 'Submission not found'
    })
  }
  
  if (submission.userId !== user.id && user.role !== 'ADMIN') {
    throw createError({
      statusCode: 403,
      message: 'Not authorized to view this submission'
    })
  }
  
  return {
    currentVersion: submission.currentVersion,
    versions: submission.versions
  }
})
