import { defineEventHandler, getQuery } from 'h3'
import { getLinearIssues } from '~/server/utils/linear'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  
  if (!query.teamId) {
    throw createError({
      statusCode: 400,
      message: 'Team ID is required'
    })
  }
  
  try {
    const issues = await getLinearIssues(query.teamId as string, {
      state: query.state as string,
      assigneeId: query.assigneeId as string,
      first: query.first ? parseInt(query.first as string) : undefined
    })
    return { issues }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch Linear issues'
    })
  }
})
