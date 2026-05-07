import { verifyCalendlyWebhook, parseCalendlyWebhook } from '../../utils/calendly'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const signature = getHeader(event, 'calendly-webhook-signature')

  const config = useRuntimeConfig()
  const signingKey = config.calendlyWebhookSigningKey as string | undefined

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

    // Find the user by the invitee's email address
    let userId: string | null = null
    if (invitee.email) {
      const user = await prisma.user.findUnique({ where: { email: invitee.email } })
      if (user) {
        userId = user.id
      }
    }

    await prisma.calendlyBooking.upsert({
      where: { inviteeUri: invitee.uri },
      update: {
        status: invitee.status,
        startTime: new Date(calendlyEvent.start_time),
        endTime: new Date(calendlyEvent.end_time),
        ...(userId ? { userId } : {}),
      },
      create: {
        eventUri: calendlyEvent.uri,
        inviteeUri: invitee.uri,
        userId: userId || '',
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
