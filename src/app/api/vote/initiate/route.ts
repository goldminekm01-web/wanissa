export const dynamic = "force-dynamic"

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { initiateStkPush } from '@/lib/mpesa';

const PRICE_PER_VOTE = 10;

export async function POST(req: Request) {
  try {
    const { phone, candidate_code, votes } = await req.json();

    if (!phone || !candidate_code) {
      return NextResponse.json({ error: 'Phone number and candidate code are required' }, { status: 400 });
    }

    const votesCount = parseInt(votes, 10) || 1;
    if (votesCount <= 0 || votesCount > 1000) {
      return NextResponse.json({ error: 'Vote count must be between 1 and 1000' }, { status: 400 });
    }

    // Find contestant by code
    const contestant = await prisma.candidate.findUnique({
      where: { code: candidate_code.trim().toUpperCase() },
      include: { category: true },
    });

    if (!contestant) {
      return NextResponse.json({ error: `Candidate code "${candidate_code.toUpperCase()}" not found` }, { status: 404 });
    }

    if (!contestant.category.activeFlag) {
      return NextResponse.json({ error: 'Voting for this category is currently closed' }, { status: 400 });
    }

    const amountExpected = votesCount * PRICE_PER_VOTE;

    // Create pending VoteRequest
    const voteRequest = await prisma.voteRequest.create({
      data: {
        phone,
        candidateId: contestant.id,
        votesRequested: votesCount,
        amountExpected,
        status: 'pending',
      },
    });

    // Initiate STK Push
    const description = `${votesCount} vote(s) for ${contestant.name}`;
    const mpesaRes = await initiateStkPush(
      phone,
      amountExpected,
      voteRequest.id.slice(0, 12),
      description
    );

    // Store CheckoutRequestID so callback can match it
    if (mpesaRes.CheckoutRequestID) {
      await prisma.voteRequest.update({
        where: { id: voteRequest.id },
        data: { mpesaTransactionId: mpesaRes.CheckoutRequestID },
      });
    }

    return NextResponse.json({
      success: true,
      request_id: voteRequest.id,
      checkout_request_id: mpesaRes.CheckoutRequestID,
      message: 'STK Push sent! Check your phone and enter your M-Pesa PIN.',
    });

  } catch (error: unknown) {
    console.error('Initiate Vote Error:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to initiate vote. Please try again.' },
      { status: 500 }
    );
  }
}
