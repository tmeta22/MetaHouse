import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../../lib/db'
import * as schema from '../../../../lib/db/schema'

export async function POST(request: NextRequest) {
  try {
    // Get the database instance
    const database = await db
    
    // Delete all data from each table using drizzle ORM
    const deleteOperations = [
      database.delete(schema.tasks),
      database.delete(schema.events), 
      database.delete(schema.subscriptions),
      database.delete(schema.familyMembers),
      database.delete(schema.transactions),
      database.delete(schema.trips),
      database.delete(schema.parties),
      database.delete(schema.tripItinerary),
      database.delete(schema.partyTasks),
      database.delete(schema.participants)
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