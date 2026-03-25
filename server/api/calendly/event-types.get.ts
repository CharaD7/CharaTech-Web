import { defineEventHandler } from 'h3'
import { getCalendlyEventTypes } from '~/server/utils/calendly'

export default defineEventHandler(async () => {
  try {
    const eventTypes = await getCalendlyEventTypes()
    return { eventTypes }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch Calendly event types'
    })
  }
})
