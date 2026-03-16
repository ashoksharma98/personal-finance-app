import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const transaction = await request.json();
  
  const runTransaction = db.transaction((data) => {
    // Insert transaction
    const insertStmt = db.prepare(`
      INSERT INTO transactions (id, userId, accountId, type, amount, category, date, note)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertStmt.run(
      data.id,
      userId,
      data.accountId,
      data.type,
      data.amount,
      data.category,
      data.date,
      data.note
    );

    // Update account balance
    const amountChange = data.type === 'credit' ? data.amount : -data.amount;
    const updateStmt = db.prepare('UPDATE accounts SET currentBalance = currentBalance + ? WHERE id = ? AND userId = ?');
    updateStmt.run(amountChange, data.accountId, userId);
  });

  try {
    runTransaction(transaction);
    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to add transaction' }, { status: 500 });
  }
}
