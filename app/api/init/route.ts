import { NextResponse } from 'next/server';
import { initializeDatabase } from '../../../lib/db';
import { seedDatabase } from '../../../lib/db/service';

export async function POST() {
  try {
    await initializeDatabase();
    await seedDatabase();
    return NextResponse.json({ success: true, message: 'Database initialized and seeded successfully' });
  } catch (error) {
    console.error('Error initializing database:', error);
    return NextResponse.json({ error: 'Failed to initialize database' }, { status: 500 });
  }
}

// Allow GET requests for easy browser access
export async function GET() {
  return POST();
}