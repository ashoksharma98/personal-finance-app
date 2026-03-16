import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth-utils';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const newData = await request.json();

  const runUpdate = db.transaction((data) => {
    // Get old transaction to revert balance
    const oldTransaction = db.prepare('SELECT * FROM transactions WHERE id = ? AND userId = ?').get(id, userId) as any;
    if (!oldTransaction) throw new Error('Transaction not found');

    // Revert old balance
    const oldAmountChange = oldTransaction.type === 'credit' ? -oldTransaction.amount : oldTransaction.amount;
    db.prepare('UPDATE accounts SET currentBalance = currentBalance + ? WHERE id = ? AND userId = ?')
      .run(oldAmountChange, oldTransaction.accountId, userId);

    // Update transaction
    db.prepare(`
      UPDATE transactions 
      SET accountId = ?, type = ?, amount = ?, category = ?, date = ?, note = ?
      WHERE id = ? AND userId = ?
    `).run(
      data.accountId,
      data.type,
      data.amount,
      data.category,
      data.date,
      data.note,
      id,
      userId
    );

    // Apply new balance
    const newAmountChange = data.type === 'credit' ? data.amount : -data.amount;
    db.prepare('UPDATE accounts SET currentBalance = currentBalance + ? WHERE id = ? AND userId = ?')
      .run(newAmountChange, data.accountId, userId);
  });

  try {
    runUpdate(newData);
    return NextResponse.json({ id, ...newData });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const runDelete = db.transaction(() => {
    const transaction = db.prepare('SELECT * FROM transactions WHERE id = ? AND userId = ?').get(id, userId) as any;
    if (!transaction) throw new Error('Transaction not found');

    // Revert balance
    const amountChange = transaction.type === 'credit' ? -transaction.amount : transaction.amount;
    db.prepare('UPDATE accounts SET currentBalance = currentBalance + ? WHERE id = ? AND userId = ?')
      .run(amountChange, transaction.accountId, userId);

    // Delete transaction
    db.prepare('DELETE FROM transactions WHERE id = ? AND userId = ?').run(id, userId);
  });

  try {
    runDelete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
  }
}
