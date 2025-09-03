import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../../lib/db'
import * as schema from '../../../../lib/db/schema'

export async function POST(request: NextRequest) {
  try {
    // Delete all data from each table using drizzle ORM
    const deleteOperations = [
      db.delete(schema.tasks),
      db.delete(schema.events), 
      db.delete(schema.subscriptions),
      db.delete(schema.familyMembers),
      db.delete(schema.transactions),
      db.delete(schema.trips),
      db.delete(schema.parties),
      db.delete(schema.tripItinerary),
      db.delete(schema.partyTasks),
      db.delete(schema.participants)
    ]
    
    // Execute all delete operations
    await Promise.all(deleteOperations)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database formatted successfully. All data has been deleted.' 
    }, { status: 200 })
    
  } catch (error) {
    console.error('Database format error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to format database. Please try again.' 
      },
      { status: 500 }
    )
  }
}