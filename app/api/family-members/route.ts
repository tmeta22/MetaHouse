import { NextRequest, NextResponse } from 'next/server';
import { FamilyMemberService } from '../../../lib/db/service';
import { initializeDatabase } from '../../../lib/db';

// Initialize database on server startup
initializeDatabase();

export async function GET() {
  try {
    const familyMembers = await FamilyMemberService.getAll();
    return NextResponse.json(familyMembers);
  } catch (error) {
    console.error('Error fetching family members:', error);
    return NextResponse.json({ error: 'Failed to fetch family members' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const familyMember = await FamilyMemberService.create(body);
    return NextResponse.json(familyMember);
  } catch (error) {
    console.error('Error creating family member:', error);
    return NextResponse.json({ error: 'Failed to create family member' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    const familyMember = await FamilyMemberService.update(id, updateData);
    return NextResponse.json(familyMember);
  } catch (error) {
    console.error('Error updating family member:', error);
    return NextResponse.json({ error: 'Failed to update family member' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Family member ID is required' }, { status: 400 });
    }
    await FamilyMemberService.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting family member:', error);
    return NextResponse.json({ error: 'Failed to delete family member' }, { status: 500 });
  }
}