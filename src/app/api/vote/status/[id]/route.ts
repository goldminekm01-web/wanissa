export const dynamic = "force-dynamic"

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const voteRequest = await prisma.voteRequest.findUnique({
      where: { id }
    });

    if (!voteRequest) {
      return NextResponse.json({ error: 'Vote request not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: voteRequest.id,
      status: voteRequest.status
    });
  } catch (error: unknown) {
    console.error('Status check error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
