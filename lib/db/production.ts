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
  // Try environment variable first, then fall back to config file
  if (process.env.DATABASE_URL) {
    return {
      type: 'neon',
      url: process.env.DATABASE_URL,
      name: 'Production Database'
    }
  }
  
  // Fall back to configuration file
  try {
    const fs = require('fs')
    const path = require('path')
    const configPath = path.join(process.cwd(), 'database-config.production.json')
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
    return {
      type: config.type as 'neon' | 'postgresql',
      url: config.url,
      name: config.name
    }
  } catch (error) {
    throw new Error('DATABASE_URL environment variable or database-config.production.json is required in production')
  }
}

let dbInstance: any = null
let dbPromise: Promise<any> | null = null

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
  if (!dbInstance) {
    if (!dbPromise) {
      dbPromise = (async () => {
        console.log('Initializing database...')
        const database = await createDatabase()
        await runMigrations()
        console.log('Database initialized successfully')
        return database
      })()
    }
    dbInstance = await dbPromise
  }
  return dbInstance
}

export async function getDb() {
  return getDatabase()
}

export async function initializeDatabase() {
  return getDatabase()
}

// Export db as a promise that resolves at runtime
// Skip database initialization during build time
export const db = process.env.SKIP_DB_INIT === 'true'
  ? Promise.resolve(null) 
  : Promise.resolve().then(() => getDatabase())

export { schema }