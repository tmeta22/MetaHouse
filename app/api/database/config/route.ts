import { NextRequest, NextResponse } from 'next/server'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'

const CONFIG_FILE = join(process.cwd(), 'database-config.json')

interface DatabaseConfig {
  type: 'sqlite' | 'neon' | 'postgresql'
  url: string
  name: string
  connected?: boolean
}

// Get current database configuration
export async function GET() {
  try {
    let config: DatabaseConfig = {
      type: 'sqlite',
      url: '',
      name: 'Local SQLite',
      connected: true
    }

    if (existsSync(CONFIG_FILE)) {
      const fileContent = readFileSync(CONFIG_FILE, 'utf-8')
      config = JSON.parse(fileContent)
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error reading database config:', error)
    return NextResponse.json(
      { error: 'Failed to read database configuration' },
      { status: 500 }
    )
  }
}

// Save database configuration
export async function POST(request: NextRequest) {
  try {
    const config: DatabaseConfig = await request.json()
    
    // Validate configuration
    if (!config.type || !config.name) {
      return NextResponse.json(
        { error: 'Database type and name are required' },
        { status: 400 }
      )
    }

    if (config.type !== 'sqlite' && !config.url) {
      return NextResponse.json(
        { error: 'Connection URL is required for cloud databases' },
        { status: 400 }
      )
    }

    // Save configuration
    config.connected = true
    writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2))

    // Update environment variable for runtime
    if (config.type === 'sqlite') {
      process.env.DATABASE_URL = 'file:./family-hub.db'
    } else {
      process.env.DATABASE_URL = config.url
    }

    return NextResponse.json({ success: true, message: 'Database configuration saved' })
  } catch (error) {
    console.error('Error saving database config:', error)
    return NextResponse.json(
      { error: 'Failed to save database configuration' },
      { status: 500 }
    )
  }
}