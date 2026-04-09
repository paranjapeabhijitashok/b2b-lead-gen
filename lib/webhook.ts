export interface WebhookPayload {
  name: string
  aboutProduct: string
  productUrl: string
  city: string
  state: string
  industry: string
}

export interface WebhookResponse {
  status: string
  message: string
  sheets_url: string
  execution_id: string
}

export async function submitLeadForm(payload: WebhookPayload): Promise<WebhookResponse> {
  const url = process.env.N8N_WEBHOOK_URL
  if (!url) throw new Error('N8N_WEBHOOK_URL is not set')

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) throw new Error(`Webhook error: ${res.status}`)
  return res.json() as Promise<WebhookResponse>
}
