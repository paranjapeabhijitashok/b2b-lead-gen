import { NextRequest, NextResponse } from 'next/server'
import { submitLeadForm, WebhookResponse } from '@/lib/webhook'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, aboutProduct, productUrl, city, state, industries } = body

    if (!industries || !Array.isArray(industries) || industries.length === 0) {
      return NextResponse.json({ error: 'Select at least one industry.' }, { status: 400 })
    }

    let firstResult: WebhookResponse | null = null

    for (const industry of industries as string[]) {
      const result = await submitLeadForm({ name, aboutProduct, productUrl, city, state, industry })
      if (!firstResult) firstResult = result
    }

    return NextResponse.json(firstResult)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
