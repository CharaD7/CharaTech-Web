import { defineEventHandler, getRouterParam } from 'h3'
import { prisma } from '~/server/utils/prisma'
import { verifyAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await verifyAuth(event)
  const submissionId = getRouterParam(event, 'id')
  const versionId = getRouterParam(event, 'versionId')
  
  if (!submissionId || !versionId) {
    throw createError({
      statusCode: 400,
      message: 'Submission ID and Version ID are required'
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
  
  if (submission.userId !== user.id && user.role !== 'ADMIN') {
    throw createError({
      statusCode: 403,
      message: 'Not authorized to view this submission'
    })
  }
  
  const version = await prisma.submissionVersion.findFirst({
    where: {
      submissionId,
      OR: [
        { id: versionId },
        { version: parseInt(versionId as string) || undefined }
      ]
    }
  })
  
  if (!version) {
    throw createError({
      statusCode: 404,
      message: 'Version not found'
    })
  }
  
  return { version }
})
