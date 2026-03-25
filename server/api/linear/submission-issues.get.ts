import { defineEventHandler, getQuery } from 'h3'
import { prisma } from '~/server/utils/prisma'
import { verifyAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await verifyAuth(event)
  
  const query = getQuery(event)
  const submissionId = query.submissionId as string
  
  if (!submissionId) {
    throw createError({
      statusCode: 400,
      message: 'Submission ID is required'
    })
  }
  
  const issues = await prisma.linearIssue.findMany({
    where: { submissionId },
    orderBy: { linearNumber: 'asc' }
  })
  
  return { issues }
})
