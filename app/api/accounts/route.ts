import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const account = await request.json();
    
    const stmt = db.prepare(`
      INSERT INTO accounts (id, userId, bankId, accountName, accountNumber, lastFourDigits, accountType, openingBalance, currentBalance)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      account.id,
      userId,
      account.bankId,
      account.accountName,
      account.accountNumber,
      account.lastFourDigits,
      account.accountType,
      account.openingBalance,
      account.currentBalance
    );

    return NextResponse.json(account);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to add account' }, { status: 500 });
  }
}
