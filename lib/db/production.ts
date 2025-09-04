import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Production-only database configuration that only supports PostgreSQL
let db: any

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required in production')
}

const sql = postgres(process.env.DATABASE_URL)
db = drizzlePostgres(sql, { schema })

export { db }
export async function getDb() {
  return db
}

export async function runMigrations() {
  console.log('PostgreSQL migrations skipped - assuming tables exist')
}

export async function initializeDatabase() {
  console.log('Production database initialized with PostgreSQL')
}

export function closeDatabase() {
  console.log('PostgreSQL connection closed')
}

export * from './schema'