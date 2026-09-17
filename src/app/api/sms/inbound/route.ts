export const dynamic = "force-dynamic"

import { NextResponse } from 'next/server';
import { sendSMS } from '@/lib/sms';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    // Africa's Talking sends x-www-form-urlencoded by default. 
    // We parse it as form data.
    const formData = await req.formData();
    const from = formData.get('from') as string;
    const text = formData.get('text') as string;

    if (!from || !text) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    console.log(`Received SMS from ${from}: ${text}`);

    // Parse the SMS text. Expected format: "VOTE [CANDIDATE_CODE] [OPTIONAL_VOTES]"
    const parts = text.trim().split(/\s+/);
    
    if (parts[0].toUpperCase() !== 'VOTE' || parts.length < 2) {
      await sendSMS(from, 'Invalid format. To vote, send: VOTE [CODE] [NUMBER_OF_VOTES]. Example: VOTE JONOE123 3');
      return NextResponse.json({ success: true });
    }

    const candidateCode = parts[1].toUpperCase();
    let votes = 1; // Default to 1 vote
    if (parts.length > 2) {
      const parsedVotes = parseInt(parts[2], 10);
      if (!isNaN(parsedVotes) && parsedVotes > 0) {
        votes = parsedVotes;
      }
    }

    // Verify candidate exists
    const contestant = await prisma.candidate.findUnique({
      where: { code: candidateCode }
    });

    if (!contestant) {
      await sendSMS(from, `Candidate code ${candidateCode} not found. Please check and try again.`);
      return NextResponse.json({ success: true });
    }

    // Generate Payment Link
    // In production, BASE_URL should be the actual domain.
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const paymentLink = `${baseUrl}/vote?code=${candidateCode}&phone=${encodeURIComponent(from)}&votes=${votes}`;

    const message = `You are about to cast ${votes} vote(s) for ${contestant.name}. Click here to pay ${votes * 10} Ksh and confirm: ${paymentLink}`;
    
    await sendSMS(from, message);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('SMS Inbound Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
