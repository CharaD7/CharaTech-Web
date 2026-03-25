import { createCalendlySchedulingLink } from '../../utils/calendly'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const query = getQuery(event)
  
  const eventTypeUri = query.eventTypeUri as string
  
  if (!eventTypeUri) {
    throw createError({
      statusCode: 400,
      message: 'Event type URI is required'
    })
  }
  
  const schedulingLink = createCalendlySchedulingLink(eventTypeUri, user.id)
  
  return { link: schedulingLink }
})
