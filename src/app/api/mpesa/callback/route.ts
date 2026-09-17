import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log('M-Pesa Callback received:', JSON.stringify(data, null, 2));

    const stkCallback = data?.Body?.stkCallback;
    if (!stkCallback) {
      return NextResponse.json({ error: 'Invalid callback payload' }, { status: 400 });
    }

    const { CheckoutRequestID, ResultCode, CallbackMetadata } = stkCallback;

    // Find the pending VoteRequest using CheckoutRequestID
    const voteRequest = await prisma.voteRequest.findUnique({
      where: { mpesaTransactionId: CheckoutRequestID }
    });

    if (!voteRequest) {
      console.error('VoteRequest not found for CheckoutRequestID:', CheckoutRequestID);
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Check if it's already processed to ensure idempotency
    if (voteRequest.status !== 'pending') {
      return NextResponse.json({ success: true, message: 'Already processed' });
    }

    if (ResultCode === 0 && CallbackMetadata) {
      // Payment successful
      const items = CallbackMetadata.Item || [];
      let amount = 0;
      let receiptNumber = '';
      let phoneNumber = '';

      items.forEach((item: { Name: string; Value: unknown }) => {
        if (item.Name === 'Amount') amount = Number(item.Value);
        if (item.Name === 'MpesaReceiptNumber') receiptNumber = String(item.Value);
        if (item.Name === 'PhoneNumber') phoneNumber = String(item.Value);
      });

      // Validate exact amount matches
      if (amount !== voteRequest.amountExpected) {
        console.error(`Amount mismatch: expected ${voteRequest.amountExpected}, got ${amount}`);
        // Still save transaction but mark vote as failed or partial
        await prisma.transaction.create({
          data: {
            phone: phoneNumber || voteRequest.phone,
            mpesaTransactionId: receiptNumber || CheckoutRequestID,
            amount: amount,
            status: 'failed_amount_mismatch',
            rawCallback: JSON.stringify(data)
          }
        });
        await prisma.voteRequest.update({
          where: { id: voteRequest.id },
          data: { status: 'failed' } // Failed due to incorrect amount
        });
        return NextResponse.json({ success: true, message: 'Invalid amount received' });
      }

      // Successful transaction
      // Execute in a transaction to ensure atomicity
      await prisma.$transaction(async (tx) => {
        // 1. Create Transaction record
        await tx.transaction.create({
          data: {
            phone: phoneNumber || voteRequest.phone,
            mpesaTransactionId: receiptNumber,
            amount: amount,
            status: 'success',
            rawCallback: JSON.stringify(data)
          }
        });

        // 2. Mark VoteRequest as paid
        await tx.voteRequest.update({
          where: { id: voteRequest.id },
          data: { status: 'paid' }
        });

        // 3. Increment Contestant votes
        await tx.contestant.update({
          where: { id: voteRequest.candidateId },
          data: { votesCount: { increment: voteRequest.votesRequested } }
        });
      });

      return NextResponse.json({ success: true, message: 'Payment processed and votes awarded' });

    } else {
      // Payment failed (cancelled, insufficient funds, etc.)
      await prisma.voteRequest.update({
        where: { id: voteRequest.id },
        data: { status: 'failed' }
      });

      return NextResponse.json({ success: true, message: 'Payment failed handled' });
    }

  } catch (error: unknown) {
    console.error('M-Pesa Callback Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
