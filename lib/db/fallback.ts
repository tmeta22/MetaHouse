// Fallback database module for build time
// This provides null implementations to prevent build failures

export const db = Promise.resolve(null)

export const schema = {}

// Fallback functions that return empty results
export const getDatabase = () => Promise.resolve(null)
export const initializeDatabase = () => Promise.resolve(null)