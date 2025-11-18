import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Get the webhook URL for ConversationRelay
  // Use the request host header, or fall back to environment variables
  const host = req.headers.host || process.env.VERCEL_URL || 'your-app.vercel.app';
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const webhookUrl = `${protocol}://${host}`;
  const webhookPath = `${webhookUrl}/api/twilio/conversation/webhook`;
  
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <ConversationRelay>
      <Webhook url="${webhookPath}" />
    </ConversationRelay>
  </Connect>
</Response>`;

  res.setHeader('Content-Type', 'application/xml');
  res.status(200).send(twiml);
}
