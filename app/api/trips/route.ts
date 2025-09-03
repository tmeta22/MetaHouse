import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { trips, tripItinerary, participants } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET() {
  try {
    const allTrips = await db.select().from(trips).orderBy(desc(trips.createdAt))
    return NextResponse.json(allTrips)
  } catch (error) {
    console.error('Error fetching trips:', error)
    return NextResponse.json({ error: 'Failed to fetch trips' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, destination, startDate, endDate, budget, description, organizer } = body

    if (!title || !destination || !startDate || !endDate || !organizer) {
      return NextResponse.json(
        { error: 'Missing required fields: title, destination, startDate, endDate, organizer' },
        { status: 400 }
      )
    }

    const tripId = `trip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const newTrip = {
      id: tripId,
      title,
      destination,
      startDate,
      endDate,
      budget: budget || null,
      description: description || null,
      organizer,
      status: 'planning' as const
    }

    await db.insert(trips).values(newTrip)
    return NextResponse.json(newTrip, { status: 201 })
  } catch (error) {
    console.error('Error creating trip:', error)
    return NextResponse.json({ error: 'Failed to create trip' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Trip ID is required' }, { status: 400 })
    }

    await db.update(trips)
      .set({ ...updateData, updatedAt: new Date().toISOString() })
      .where(eq(trips.id, id))

    const updatedTrip = await db.select().from(trips).where(eq(trips.id, id))
    return NextResponse.json(updatedTrip[0])
  } catch (error) {
    console.error('Error updating trip:', error)
    return NextResponse.json({ error: 'Failed to update trip' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Trip ID is required' }, { status: 400 })
    }

    // Delete related data first
    await db.delete(tripItinerary).where(eq(tripItinerary.tripId, id))
    await db.delete(participants).where(eq(participants.eventId, id))
    await db.delete(trips).where(eq(trips.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting trip:', error)
    return NextResponse.json({ error: 'Failed to delete trip' }, { status: 500 })
  }
}