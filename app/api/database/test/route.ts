import { NextRequest, NextResponse } from 'next/server'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js'
import Database from 'better-sqlite3'
import postgres from 'postgres'
import { existsSync } from 'fs'
import { join } from 'path'

interface DatabaseConfig {
  type: 'sqlite' | 'neon' | 'postgresql'
  url: string
  name: string
}

export async function POST(request: NextRequest) {
  try {
    const config: DatabaseConfig = await request.json()

    if (!config.type) {
      return NextResponse.json(
        { success: false, error: 'Database type is required' },
        { status: 400 }
      )
    }

    let testResult = { success: false, error: 'Unknown error' }

    switch (config.type) {
      case 'sqlite':
        testResult = await testSQLiteConnection()
        break
      case 'neon':
      case 'postgresql':
        testResult = await testPostgreSQLConnection(config.url)
        break
      default:
        return NextResponse.json(
          { success: false, error: 'Unsupported database type' },
          { status: 400 }
        )
    }

    return NextResponse.json(testResult)
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to test database connection' },
      { status: 500 }
    )
  }
}

async function testSQLiteConnection(): Promise<{ success: boolean; error: string }> {
  try {
    const dbPath = join(process.cwd(), 'family-hub.db')
    
    // Check if database file exists or can be created
    if (!existsSync(dbPath)) {
      // Try to create a test database
      const testDb = new Database(dbPath)
      testDb.close()
    }

    // Test connection
    const db = new Database(dbPath)
    const result = db.prepare('SELECT 1 as test').get()
    db.close()

    if (result && (result as any).test === 1) {
      return { success: true, error: '' }
    } else {
      return { success: false, error: 'SQLite connection test failed' }
    }
  } catch (error) {
    return { 
      success: false, 
      error: `SQLite connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}

async function testPostgreSQLConnection(connectionUrl: string): Promise<{ success: boolean; error: string }> {
  if (!connectionUrl) {
    return { success: false, error: 'Connection URL is required' }
  }

  let sql: any = null
  
  try {
    // Parse and validate URL
    const url = new URL(connectionUrl)
    if (!url.protocol.startsWith('postgres')) {
      return { success: false, error: 'Invalid PostgreSQL connection URL' }
    }

    // Create connection
    sql = postgres(connectionUrl, {
      max: 1,
      idle_timeout: 5,
      connect_timeout: 10
    })

    // Test connection with a simple query
    const result = await sql`SELECT 1 as test`
    
    if (result && result[0] && result[0].test === 1) {
      return { success: true, error: '' }
    } else {
      return { success: false, error: 'PostgreSQL connection test failed' }
    }
  } catch (error) {
    let errorMessage = 'Unknown error'
    
    if (error instanceof Error) {
      errorMessage = error.message
      
      // Provide more specific error messages
      if (errorMessage.includes('ENOTFOUND')) {
        errorMessage = 'Database host not found. Please check your connection URL.'
      } else if (errorMessage.includes('ECONNREFUSED')) {
        errorMessage = 'Connection refused. Please check if the database is running and accessible.'
      } else if (errorMessage.includes('authentication failed')) {
        errorMessage = 'Authentication failed. Please check your username and password.'
      } else if (errorMessage.includes('database') && errorMessage.includes('does not exist')) {
        errorMessage = 'Database does not exist. Please check your database name.'
      }
    }
    
    return { 
      success: false, 
      error: `PostgreSQL connection failed: ${errorMessage}` 
    }
  } finally {
    // Clean up connection
    if (sql) {
      try {
        await sql.end()
      } catch (cleanupError) {
        console.error('Error closing PostgreSQL connection:', cleanupError)
      }
    }
  }
}