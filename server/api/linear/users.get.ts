import { getLinearUsers } from '../../utils/linear'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  
  try {
    const users = await getLinearUsers(query.teamId as string | undefined)
    return { users }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch Linear users'
    })
  }
})
