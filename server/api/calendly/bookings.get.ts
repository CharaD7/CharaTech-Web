import { getCalendlyScheduledEvents } from '../../utils/calendly'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  
  const localBookings = await prisma.calendlyBooking.findMany({
    where: { userId: user.id },
    orderBy: { startTime: 'desc' },
    take: 20
  })
  
  let externalEvents: any[] = []
  if ((user as any).calendlyUri) {
    try {
      const events = await getCalendlyScheduledEvents({ user: (user as any).calendlyUri })
      externalEvents = events.map((e: any) => ({
        eventUri: e.uri,
        eventName: e.name,
        startTime: e.start_time,
        endTime: e.end_time,
        status: e.status,
        location: e.location?.join_url || e.location?.location
      }))
    } catch (error) {
      console.error('Failed to fetch Calendly events:', error)
    }
  }
  
  return { 
    bookings: [...localBookings, ...externalEvents].sort(
      (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    )
  }
})
