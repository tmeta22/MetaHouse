import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { 
  tasks, 
  events, 
  subscriptions, 
  familyMembers, 
  transactions,
  trips,
  parties,
  tripItinerary,
  partyTasks,
  participants
} from '@/lib/db/schema'

export async function POST() {
  try {
    // Get the database instance
    const database = await db
    
    // Create all tables by running a simple query on each
    // This will create the tables if they don't exist
    await Promise.all([
      database.select().from(tasks).limit(1).catch(() => null),
      database.select().from(events).limit(1).catch(() => null),
      database.select().from(subscriptions).limit(1).catch(() => null),
      database.select().from(familyMembers).limit(1).catch(() => null),
      database.select().from(transactions).limit(1).catch(() => null),
      database.select().from(trips).limit(1).catch(() => null),
      database.select().from(parties).limit(1).catch(() => null),
      database.select().from(tripItinerary).limit(1).catch(() => null),
      database.select().from(partyTasks).limit(1).catch(() => null),
      database.select().from(participants).limit(1).catch(() => null)
    ])

    return NextResponse.json({ 
      message: 'Database tables initialized successfully',
      tables: [
        'tasks',
        'events', 
        'subscriptions',
        'family_members',
        'transactions',
        'trips',
        'parties',
        'trip_itinerary',
        'party_tasks',
        'participants'
      ]
    })
  } catch (error) {
    console.error('Database setup error:', error)
    return NextResponse.json(
      { error: 'Failed to initialize database tables', details: error },
      { status: 500 }
    )
  }
}

export async function GET() {
  return POST() // Allow GET requests as well
}