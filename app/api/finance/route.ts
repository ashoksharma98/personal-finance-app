import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const banks = db.prepare('SELECT * FROM banks WHERE userId = ?').all(userId);
    const accounts = db.prepare('SELECT * FROM accounts WHERE userId = ?').all(userId);
    const transactions = db.prepare('SELECT * FROM transactions WHERE userId = ? ORDER BY date DESC').all(userId);

    return NextResponse.json({
      banks,
      accounts,
      transactions
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
