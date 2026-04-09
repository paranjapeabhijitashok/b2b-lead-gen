export async function submitLeadForm(data: Record<string, string>) {
  const url = process.env.N8N_WEBHOOK_URL;
  if (!url) throw new Error('N8N_WEBHOOK_URL is not set');

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error(`Webhook error: ${res.status}`);
  return res.json() as Promise<{ status: string; message: string; sheets_url: string }>;
}
