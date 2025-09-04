import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function POST() {
  try {
    console.log('Starting migration to create planning tables...')
    
    // Get the database instance
    const database = await db
    
    // Create tables directly using SQL
    const tables = [
      {
        name: 'trips',
        sql: `CREATE TABLE IF NOT EXISTS "trips" (
          "id" text PRIMARY KEY NOT NULL,
          "title" text NOT NULL,
          "destination" text NOT NULL,
          "start_date" text NOT NULL,
          "end_date" text NOT NULL,
          "budget" real,
          "status" text DEFAULT 'planning' NOT NULL,
          "description" text,
          "organizer" text NOT NULL,
          "created_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL,
          "updated_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL
        )`
      },
      {
        name: 'parties',
        sql: `CREATE TABLE IF NOT EXISTS "parties" (
          "id" text PRIMARY KEY NOT NULL,
          "title" text NOT NULL,
          "type" text NOT NULL,
          "date" text NOT NULL,
          "time" text NOT NULL,
          "location" text NOT NULL,
          "budget" real,
          "guest_count" integer DEFAULT 0,
          "status" text DEFAULT 'planning' NOT NULL,
          "description" text,
          "organizer" text NOT NULL,
          "created_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL,
          "updated_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL
        )`
      },
      {
        name: 'trip_itinerary',
        sql: `CREATE TABLE IF NOT EXISTS "trip_itinerary" (
          "id" text PRIMARY KEY NOT NULL,
          "trip_id" text NOT NULL,
          "day" integer NOT NULL,
          "time" text,
          "activity" text NOT NULL,
          "location" text,
          "cost" real,
          "notes" text,
          "created_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL
        )`
      },
      {
        name: 'party_tasks',
        sql: `CREATE TABLE IF NOT EXISTS "party_tasks" (
          "id" text PRIMARY KEY NOT NULL,
          "party_id" text NOT NULL,
          "task" text NOT NULL,
          "assignee" text,
          "due_date" text,
          "completed" boolean DEFAULT false NOT NULL,
          "cost" real,
          "notes" text,
          "created_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL
        )`
      },
      {
        name: 'participants',
        sql: `CREATE TABLE IF NOT EXISTS "participants" (
          "id" text PRIMARY KEY NOT NULL,
          "event_id" text NOT NULL,
          "event_type" text NOT NULL,
          "name" text NOT NULL,
          "email" text,
          "phone" text,
          "role" text DEFAULT 'participant',
          "status" text DEFAULT 'invited' NOT NULL,
          "created_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL
        )`
      }
    ]
    
    let createdTables = 0
    
    for (const table of tables) {
      try {
        console.log(`Creating table: ${table.name}`)
        await database.execute(sql.raw(table.sql))
        console.log(`✓ Table ${table.name} created successfully`)
        createdTables++
      } catch (error) {
        console.error(`Error creating table ${table.name}:`, error)
        // Continue with other tables
      }
    }
    
    return NextResponse.json({ 
      message: 'Migration completed successfully',
      tablesCreated: createdTables,
      totalTables: tables.length
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { error: 'Migration failed', details: error },
      { status: 500 }
    )
  }
}

export async function GET() {
  return POST() // Allow GET requests as well
}