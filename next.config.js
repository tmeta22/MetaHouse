/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['better-sqlite3'],
  env: {
    SKIP_DB_INIT: process.env.NODE_ENV === 'production' ? 'true' : 'false'
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('better-sqlite3')
      // In production, completely ignore SQLite modules
      if (process.env.NODE_ENV === 'production') {
        config.externals.push('drizzle-orm/better-sqlite3')
        config.externals.push('drizzle-orm/better-sqlite3/migrator')
      }
    }
    return config
  },
  // PWA Configuration
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json'
          }
        ]
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript'
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig