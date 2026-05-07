import { createCalendlySchedulingLink } from '../../utils/calendly'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const query = getQuery(event)

  const schedulingUrl = query.schedulingUrl as string

  if (!schedulingUrl) {
    throw createError({
      statusCode: 400,
      message: 'Scheduling URL is required'
    })
  }

  const schedulingLink = createCalendlySchedulingLink(schedulingUrl)

  return { link: schedulingLink }
})
