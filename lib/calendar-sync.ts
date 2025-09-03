import { Trip, Party } from './db/schema'

// Calendar event interface matching the DataContext Event type
export interface CalendarEvent {
  title: string
  date: string
  time: string
  member: string
  category: 'personal' | 'work' | 'family' | 'health' | 'social'
  description?: string
}

/**
 * Convert a trip to calendar events
 * Creates events for start and end dates
 */
export function tripToCalendarEvents(trip: Trip): CalendarEvent[] {
  const events: CalendarEvent[] = []
  
  // Start date event
  events.push({
    title: `🧳 Trip Start: ${trip.title}`,
    date: trip.startDate,
    time: '09:00', // Default start time
    member: trip.organizer,
    category: 'family',
    description: `Trip to ${trip.destination}. ${trip.description || ''}`
  })
  
  // End date event (if different from start date)
  if (trip.endDate !== trip.startDate) {
    events.push({
      title: `🏠 Trip End: ${trip.title}`,
      date: trip.endDate,
      time: '18:00', // Default end time
      member: trip.organizer,
      category: 'family',
      description: `Return from ${trip.destination}`
    })
  }
  
  return events
}

/**
 * Convert a party to a calendar event
 */
export function partyToCalendarEvent(party: Party): CalendarEvent {
  const typeEmojis: Record<string, string> = {
    birthday: '🎂',
    anniversary: '💕',
    holiday: '🎄',
    celebration: '🎉',
    gathering: '👥',
    other: '🎊'
  }
  
  return {
    title: `${typeEmojis[party.type] || '🎊'} ${party.title}`,
    date: party.date,
    time: party.time,
    member: party.organizer,
    category: 'family',
    description: `${party.type.charAt(0).toUpperCase() + party.type.slice(1)} at ${party.location}. ${party.description || ''}`
  }
}

/**
 * Sync trips and parties with calendar events
 */
export async function syncPlanningWithCalendar(
  trips: Trip[],
  parties: Party[],
  addEvent: (event: CalendarEvent) => Promise<void>
) {
  try {
    // Convert trips to calendar events
    for (const trip of trips) {
      const events = tripToCalendarEvents(trip)
      for (const event of events) {
        await addEvent(event)
      }
    }
    
    // Convert parties to calendar events
    for (const party of parties) {
      const event = partyToCalendarEvent(party)
      await addEvent(event)
    }
    
    console.log('Successfully synced planning events with calendar')
  } catch (error) {
    console.error('Failed to sync planning events with calendar:', error)
    throw error
  }
}

/**
 * Check if a calendar event was created from a trip or party
 */
export function isGeneratedEvent(eventTitle: string): boolean {
  const prefixes = ['🧳 Trip Start:', '🏠 Trip End:', '🎂', '💕', '🎄', '🎉', '👥', '🎊']
  return prefixes.some(prefix => eventTitle.includes(prefix))
}

/**
 * Extract trip or party ID from a generated calendar event title
 */
export function extractPlanningId(eventTitle: string): string | null {
  // This would need to be enhanced based on how we want to link events
  // For now, we'll use the title to match
  const match = eventTitle.match(/(?:Trip Start:|Trip End:|🎂|💕|🎄|🎉|👥|🎊)\s*(.+)/)
  return match ? match[1] : null
}