import crypto from 'crypto'

const CALENDLY_API_URL = 'https://api.calendly.com'

function getCalendlyHeaders() {
  const accessToken = process.env.CALENDLY_ACCESS_TOKEN
  
  if (!accessToken) {
    throw createError({
      statusCode: 500,
      message: 'Calendly access token not configured'
    })
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`
  }
}

interface CalendlyEventType {
  uri: string
  name: string
  duration: number
  description?: string
  color: string
  active: boolean
}

interface CalendlyEvent {
  uri: string
  name: string
  status: string
  start_time: string
  end_time: string
  location?: {
    type: string
    location?: string
    join_url?: string
  }
  invitees_counter: {
    total: number
    active: number
    limit: number
  }
}

interface CalendlyInvitee {
  uri: string
  email: string
  name: string
  status: string
  cancel_url: string
  reschedule_url: string
  cancellation?: {
    cancel_url: string
    reason: string
  }
  questions_and_answers?: Array<{
    question: string
    answer: string
  }>
}

export async function getCalendlyEventTypes(): Promise<CalendlyEventType[]> {
  const response = await fetch(`${CALENDLY_API_URL}/event_types`, {
    headers: getCalendlyHeaders()
  })

  if (!response.ok) {
    throw createError({
      statusCode: response.status,
      message: `Calendly API error: ${response.statusText}`
    })
  }

  const data = await response.json()
  return data.collection.filter((et: any) => et.active)
}

export async function getCalendlyScheduledEvents(options?: {
  user?: string
  count?: number
}): Promise<CalendlyEvent[]> {
  const params = new URLSearchParams()
  
  if (options?.user) {
    params.append('user', options.user)
  }
  params.append('count', String(options?.count || 10))
  params.append('sort', 'start_time:desc')

  const response = await fetch(`${CALENDLY_API_URL}/scheduled_events?${params}`, {
    headers: getCalendlyHeaders()
  })

  if (!response.ok) {
    throw createError({
      statusCode: response.status,
      message: `Calendly API error: ${response.statusText}`
    })
  }

  const data = await response.json()
  return data.collection
}

export async function getCalendlyInvitees(eventUri: string): Promise<CalendlyInvitee[]> {
  const response = await fetch(`${eventUri}/invitees`, {
    headers: getCalendlyHeaders()
  })

  if (!response.ok) {
    throw createError({
      statusCode: response.status,
      message: `Calendly API error: ${response.statusText}`
    })
  }

  const data = await response.json()
  return data.collection
}

export function verifyCalendlyWebhook(signature: string, body: string, signingKey: string): boolean {
  const hmac = crypto.createHmac('sha256', signingKey)
  hmac.update(body)
  const expectedSignature = hmac.digest('hex')
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

export function parseCalendlyWebhook(body: any): {
  event: string
  payload: {
    event: CalendlyEvent
    invitee: CalendlyInvitee
  }
} {
  const eventType = body.event
  const payload = body.payload

  return {
    event: eventType,
    payload: {
      event: payload.event || payload.scheduled_event,
      invitee: payload.invitee
    }
  }
}

export function createCalendlySchedulingLink(eventTypeUri: string, userUri?: string): string {
  const baseUrl = 'https://calendly.com'
  const params = new URLSearchParams()
  
  if (userUri) {
    params.append('embed_domain', process.env.NUXT_PUBLIC_APP_URL?.replace('https://', '') || '')
  }
  
  return `${baseUrl}/${eventTypeUri.split('/').pop()}${params.toString() ? '?' + params.toString() : ''}`
}
