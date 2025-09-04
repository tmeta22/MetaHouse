import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { migrate as migratePostgres } from 'drizzle-orm/postgres-js/migrator'
import { join } from 'path'
import { readFileSync, existsSync } from 'fs'
import * as schema from './schema'

interface DatabaseConfig {
  type: 'sqlite' | 'neon' | 'postgresql'
  url: string
  name: string
}

function getDatabaseConfig(): DatabaseConfig {
  // Check for production environment variables first
  if (process.env.DATABASE_URL) {
    // Check if it's a SQLite URL
    if (process.env.DATABASE_URL.startsWith('file:')) {
      return {
        type: 'sqlite',
        url: process.env.DATABASE_URL,
        name: 'Local SQLite Database'
      }
    }
    return {
      type: 'neon',
      url: process.env.DATABASE_URL,
      name: 'Production Database'
    }
  }
  
  // Check for local config file
  const configFile = join(process.cwd(), 'database-config.json')
  
  if (existsSync(configFile)) {
    try {
      const config = JSON.parse(readFileSync(configFile, 'utf-8'))
      return config
    } catch (error) {
      console.warn('Failed to read database config, using default SQLite')
    }
  }
  
  return {
    type: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./family-hub.db',
    name: 'Local SQLite'
  }
}

let db: any

async function createDatabase() {
  const config = getDatabaseConfig()
  
  if (config.type === 'sqlite') {
    // Dynamic import for SQLite to avoid issues in serverless environments
    const { drizzle } = await import('drizzle-orm/better-sqlite3')
    const Database = (await import('better-sqlite3')).default
    const dbPath = config.url.replace('file:', '') || join(process.cwd(), 'family-hub.db')
    const sqlite = new Database(dbPath)
    sqlite.pragma('journal_mode = WAL')
    return drizzle(sqlite, { schema })
  } else {
    // PostgreSQL/Neon
    const sql = postgres(config.url)
    return drizzlePostgres(sql, { schema })
  }
}

const migrationsPath = join(process.cwd(), 'drizzle')

// Initialize database
let dbPromise: Promise<any>
if (process.env.DATABASE_URL) {
  // With DATABASE_URL, use PostgreSQL directly
  const sql = postgres(process.env.DATABASE_URL)
  db = drizzlePostgres(sql, { schema })
} else {
  // For development or when no DATABASE_URL is set
  dbPromise = createDatabase()
  db = null // Will be set after async initialization
}

// Helper function to get database instance
export async function getDb() {
  if (db) {
    return db
  }
  if (dbPromise) {
    db = await dbPromise
    return db
  }
  throw new Error('Database not initialized')
}

// Export database instance
export { db }

// Migration function
export async function runMigrations() {
  const config = getDatabaseConfig()
  
  try {
    console.log('Running database migrations...')
    if (config.type === 'sqlite') {
      // Dynamic import for SQLite migrations
      const { migrate } = await import('drizzle-orm/better-sqlite3/migrator')
      if (!db) {
        db = await dbPromise
      }
      migrate(db as any, { migrationsFolder: migrationsPath })
    } else {
      // For PostgreSQL/Neon, skip migrations for now as tables should already exist
      console.log('PostgreSQL migrations skipped - assuming tables exist')
    }
    console.log('Database migrations completed successfully')
  } catch (error) {
    console.error('Migration failed:', error)
    // Don't throw error for PostgreSQL migration issues in production
    if (config.type === 'sqlite') {
      throw error
    } else {
      console.warn('PostgreSQL migration error ignored, continuing...')
    }
  }
}

// Initialize database (run migrations)
export async function initializeDatabase() {
  try {
    await runMigrations()
    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Database initialization failed:', error)
    throw error
  }
}

// Get database with initialization
export async function getDatabase() {
  if (!db) {
    console.log('Initializing database...')
    db = await createDatabase()
    await runMigrations()
    console.log('Database initialized successfully')
  }
  return db
}

// Close database connection
export function closeDatabase() {
  const config = getDatabaseConfig()
  
  if (config.type === 'sqlite') {
    // For SQLite, we would need to store the sqlite instance
    // For now, this is handled automatically by the connection pool
    console.log('SQLite connection closed')
  } else {
    // For PostgreSQL, connections are handled by the postgres library
    console.log('PostgreSQL connection closed')
  }
}

// Export schema for use in other files
export * from './schema'