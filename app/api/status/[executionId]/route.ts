import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ executionId: string }> }
) {
  const { executionId } = await params;
  const baseUrl = process.env.N8N_BASE_URL;
  const apiKey = process.env.N8N_API_KEY;

  if (!baseUrl || !apiKey) {
    return NextResponse.json({ error: 'Status check not configured' }, { status: 500 });
  }

  const res = await fetch(`${baseUrl}/api/v1/executions/${executionId}`, {
    headers: { 'X-N8N-API-KEY': apiKey },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: `Could not fetch execution status (${res.status})` },
      { status: res.status }
    );
  }

  const data = await res.json();
  const errorMessage: string | null =
    data.data?.resultData?.error?.message ??
    data.data?.resultData?.runData?.['Leads Scraper1']?.[0]?.error?.message ??
    null;

  return NextResponse.json({
    status: data.status as 'running' | 'success' | 'error' | 'waiting',
    stoppedAt: data.stoppedAt as string | null,
    errorMessage,
  });
}
