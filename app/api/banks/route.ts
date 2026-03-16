import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, name } = await request.json();
    
    const stmt = db.prepare('INSERT INTO banks (id, userId, name) VALUES (?, ?, ?)');
    stmt.run(id, userId, name);

    return NextResponse.json({ id, name });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to add bank' }, { status: 500 });
  }
}
