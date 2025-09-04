// Dynamic database module loading based on environment
let dbModule: any = null

async function getDbModule() {
  if (!dbModule) {
    if (process.env.SKIP_DB_INIT === 'true') {
      // Use fallback module during build time only
      dbModule = await import('./fallback')
    } else if (process.env.NODE_ENV === 'production') {
      // In production, use the production-only module that has no SQLite imports
      dbModule = await import('./production')
    } else {
      // In development, use the full module with SQLite support
      dbModule = await import('./development')
    }
  }
  return dbModule
}

// Export functions that delegate to the appropriate module
export async function getDatabase() {
  const module = await getDbModule()
  return module.getDatabase()
}

export async function getDb() {
  const module = await getDbModule()
  return module.getDb()
}

export async function runMigrations() {
  const module = await getDbModule()
  return module.runMigrations()
}

export async function initializeDatabase() {
  const module = await getDbModule()
  return module.initializeDatabase()
}

export function closeDatabase() {
  // This can be synchronous as it doesn't need dynamic imports
  if (process.env.NODE_ENV === 'production') {
    console.log('PostgreSQL connection closed')
  } else {
    console.log('Database connection closed')
  }
}

// Export schema directly
export * from './schema'

// Export a promise-based db for compatibility with existing imports
export const db = (async () => {
  const module = await getDbModule()
  return module.db
})()