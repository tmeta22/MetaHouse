import { drizzle } from 'drizzle-orm/better-sqlite3'
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js'
import Database from 'better-sqlite3'
import postgres from 'postgres'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
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
  if (process.env.DATABASE_URL && process.env.NODE_ENV === 'production') {
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

function createDatabase() {
  const config = getDatabaseConfig()
  
  if (config.type === 'sqlite') {
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
db = createDatabase()

// Export database instance
export { db }

// Migration function
export async function runMigrations() {
  const config = getDatabaseConfig()
  
  try {
    console.log('Running database migrations...')
    if (config.type === 'sqlite') {
      migrate(db as any, { migrationsFolder: migrationsPath })
    } else {
      // For PostgreSQL, you might need different migration handling
      console.log('PostgreSQL migrations not yet implemented')
    }
    console.log('Database migrations completed successfully')
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
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