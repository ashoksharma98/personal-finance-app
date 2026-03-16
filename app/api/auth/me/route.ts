import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import db from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null });
  }

  const user = db.prepare('SELECT id, email, name FROM users WHERE id = ?').get(session.sub) as any;
  return NextResponse.json({ user });
}
