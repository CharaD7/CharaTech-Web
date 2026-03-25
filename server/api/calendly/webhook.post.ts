import { defineEventHandler, readBody, getHeader } from 'h3'
import { prisma } from '~/server/utils/prisma'
import { verifyCalendlyWebhook, parseCalendlyWebhook } from '~/server/utils/calendly'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const signature = getHeader(event, 'calendly-webhook-signature')
  
  const signingKey = process.env.CALENDLY_WEBHOOK_SIGNING_KEY
  
  if (signingKey && signature) {
    const rawBody = JSON.stringify(body)
    const isValid = verifyCalendlyWebhook(signature, rawBody, signingKey)
    
    if (!isValid) {
      throw createError({
        statusCode: 401,
        message: 'Invalid webhook signature'
      })
    }
  }
  
  const { event: eventType, payload } = parseCalendlyWebhook(body)
  
  if (eventType === 'invitee.created') {
    const { event: calendlyEvent, invitee } = payload
    
    await prisma.calendlyBooking.upsert({
      where: { inviteeUri: invitee.uri },
      update: {
        status: invitee.status,
        startTime: new Date(calendlyEvent.start_time),
        endTime: new Date(calendlyEvent.end_time)
      },
      create: {
        eventUri: calendlyEvent.uri,
        inviteeUri: invitee.uri,
        userId: '', 
        eventName: calendlyEvent.name,
        startTime: new Date(calendlyEvent.start_time),
        endTime: new Date(calendlyEvent.end_time),
        status: invitee.status,
        cancelUrl: invitee.cancel_url,
        rescheduleUrl: invitee.reschedule_url,
        location: calendlyEvent.location?.join_url || calendlyEvent.location?.location
      }
    })
  }
  
  if (eventType === 'invitee.canceled') {
    const { invitee } = payload
    
    await prisma.calendlyBooking.update({
      where: { inviteeUri: invitee.uri },
      data: {
        status: 'cancelled',
        cancelReason: invitee.cancellation?.reason
      }
    })
  }
  
  return { success: true }
})
