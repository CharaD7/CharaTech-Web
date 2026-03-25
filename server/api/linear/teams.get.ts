import { defineEventHandler } from 'h3'
import { getLinearTeams } from '~/server/utils/linear'

export default defineEventHandler(async () => {
  try {
    const teams = await getLinearTeams()
    return { teams }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch Linear teams'
    })
  }
})
