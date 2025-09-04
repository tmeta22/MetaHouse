import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { parties, partyTasks, participants } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET() {
  try {
    const database = await db
    const allParties = await database.select().from(parties).orderBy(desc(parties.createdAt))
    return NextResponse.json(allParties)
  } catch (error) {
    console.error('Error fetching parties:', error)
    return NextResponse.json({ error: 'Failed to fetch parties' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, type, date, time, location, budget, guestCount, description, organizer } = body

    if (!title || !type || !date || !time || !location || !organizer) {
      return NextResponse.json(
        { error: 'Missing required fields: title, type, date, time, location, organizer' },
        { status: 400 }
      )
    }

    const partyId = `party_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const newParty = {
      id: partyId,
      title,
      type,
      date,
      time,
      location,
      budget: budget || null,
      guestCount: guestCount || 0,
      description: description || null,
      organizer,
      status: 'planning' as const
    }

    const database = await db
    await database.insert(parties).values(newParty)
    return NextResponse.json(newParty, { status: 201 })
  } catch (error) {
    console.error('Error creating party:', error)
    return NextResponse.json({ error: 'Failed to create party' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Party ID is required' }, { status: 400 })
    }

    const database = await db
    await database.update(parties)
      .set({ ...updateData, updatedAt: new Date().toISOString() })
      .where(eq(parties.id, id))

    const updatedParty = await database.select().from(parties).where(eq(parties.id, id))
    return NextResponse.json(updatedParty[0])
  } catch (error) {
    console.error('Error updating party:', error)
    return NextResponse.json({ error: 'Failed to update party' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Party ID is required' }, { status: 400 })
    }

    const database = await db
    // Delete related data first
    await database.delete(partyTasks).where(eq(partyTasks.partyId, id))
    await database.delete(participants).where(eq(participants.eventId, id))
    await database.delete(parties).where(eq(parties.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting party:', error)
    return NextResponse.json({ error: 'Failed to delete party' }, { status: 500 })
  }
}