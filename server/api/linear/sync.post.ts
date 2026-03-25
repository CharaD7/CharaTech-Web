import { defineEventHandler, readBody } from 'h3'
import { prisma } from '~/server/utils/prisma'
import { verifyAuth } from '~/server/utils/auth'
import { syncSubmissionToLinear } from '~/server/utils/linear'

export default defineEventHandler(async (event) => {
  const user = await verifyAuth(event)
  const body = await readBody(event)
  
  const { submissionId, teamId } = body
  
  if (!submissionId || !teamId) {
    throw createError({
      statusCode: 400,
      message: 'Submission ID and Team ID are required'
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
      message: 'Not authorized to sync this submission'
    })
  }
  
  const linearIssues = await syncSubmissionToLinear({
    projectName: submission.projectName,
    requirements: submission.requirements,
    additionalNotes: submission.additionalNotes || undefined
  }, teamId)
  
  const savedIssues = await Promise.all(
    linearIssues.map(issue => 
      prisma.linearIssue.create({
        data: {
          submissionId,
          linearId: issue.id,
          linearNumber: issue.number,
          linearTitle: issue.title,
          linearUrl: issue.url,
          linearState: issue.state,
          linearPriority: issue.priority,
          assignee: issue.assignee?.email || null,
          dueDate: issue.dueDate ? new Date(issue.dueDate) : null
        }
      })
    )
  )
  
  return { issues: savedIssues }
})
