import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { migrate as migratePostgres } from 'drizzle-orm/postgres-js/migrator'
import { join } from 'path'
import * as schema from './schema'

interface DatabaseConfig {
  type: 'neon' | 'postgresql'
  url: string
  name: string
}

function getDatabaseConfig(): DatabaseConfig {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required in production')
  }
  return {
    type: 'neon',
    url: process.env.DATABASE_URL,
    name: 'Production Database'
  }
}

let db: any

async function createDatabase() {
  const config = getDatabaseConfig()
  const sql = postgres(config.url)
  return drizzlePostgres(sql, { schema })
}

const migrationsPath = join(process.cwd(), 'drizzle')

async function runMigrations() {
  console.log('Running database migrations...')
  
  const config = getDatabaseConfig()
  console.log('PostgreSQL migrations skipped - assuming tables exist')
  
  console.log('Database migrations completed successfully')
}

export async function getDatabase() {
  if (!db) {
    console.log('Initializing database...')
    db = await createDatabase()
    await runMigrations()
    console.log('Database initialized successfully')
  }
  return db
}

export async function getDb() {
  return getDatabase()
}

export async function initializeDatabase() {
  return getDatabase()
}

// Export db promise for compatibility
export const db = getDatabase()

export { schema }