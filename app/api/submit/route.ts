import { NextRequest, NextResponse } from 'next/server';
import { submitLeadForm } from '@/lib/webhook';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await submitLeadForm(body);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
