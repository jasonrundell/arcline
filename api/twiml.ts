import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Get the webhook URL for ConversationRelay
  // Use the request host header, or fall back to environment variables
  const host = req.headers.host || process.env.VERCEL_URL || 'your-app.vercel.app';
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const webhookUrl = `${protocol}://${host}`;
  const webhookPath = `${webhookUrl}/api/twilio/conversation/webhook`;
  
  // Voice configuration: Set ttsProvider, voice, and language attributes on ConversationRelay
  // Examples:
  // - Google: ttsProvider="Google" voice="en-GB-Journey-F" language="en-GB"
  // - Amazon: ttsProvider="Amazon" voice="Joanna-Neural" language="en-US"
  // - ElevenLabs: ttsProvider="ElevenLabs" voice="NYC9WEgkq1u4jiqBseQ9" language="en-GB"
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <ConversationRelay
      ttsProvider="Google"
      voice="en-GB-Journey-F"
      language="en-GB"
    >
      <Webhook url="${webhookPath}" />
    </ConversationRelay>
  </Connect>
</Response>`;

  res.setHeader('Content-Type', 'application/xml');
  res.status(200).send(twiml);
}
